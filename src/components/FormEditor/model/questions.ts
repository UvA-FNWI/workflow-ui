import {
    type Document,
    isMap,
    isScalar,
    isSeq,
    parseDocument,
    type Scalar,
    type YAMLMap,
    type YAMLSeq,
} from "yaml";

import {unavailableNames, uniqueInternalName} from "~/components/FormEditor/model/names";
import {nodeToYaml} from "~/components/FormEditor/model/nodeYaml";
import {
    definitionChain,
    definitionFolderOf,
    findValueSet,
    listDefinitionFolders,
    listFormPaths,
    propertyFilePaths,
    propertyTargetFile,
    requireDoc,
} from "~/components/FormEditor/model/paths";
import {
    buildTypeString,
    kindOf,
    newPropertyValue,
    parseTypeString,
} from "~/components/FormEditor/model/questionTypes";
import {flatten, loadSchema} from "~/components/FormEditor/model/schema";
import type {
    ConfigDocs,
    EditorChoice,
    EditorQuestion,
    LocalText,
    QuestionKind,
} from "~/components/FormEditor/model/types";

const EMPTY_TEXT: LocalText = {en: "", nl: ""};

// A newly created field can be discarded with its last question reference until the draft is saved.
const newQuestionDefinitions = new WeakSet<YAMLMap>();
const newPropertyCollections = new WeakMap<YAMLSeq, unknown>();

/** A bilingual field may be a plain string in yaml; normalize both shapes to LocalText. */
export function readLocalText(value: unknown): LocalText {
    if (typeof value === "string") {
        return {en: value, nl: value};
    }
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return {
            en: typeof record.en === "string" ? record.en : "",
            nl: typeof record.nl === "string" ? record.nl : "",
        };
    }
    return EMPTY_TEXT;
}

export function readFormTitle(document: Document): LocalText | undefined {
    const raw = document.get("title");
    return typeof raw === "string" || isMap(raw)
        ? readLocalText(isMap(raw) ? raw.toJSON() : raw)
        : undefined;
}

function pagesSeq(doc: Document): YAMLSeq | null {
    const pages = doc.get("pages");
    return isSeq(pages) ? pages : null;
}

export function pageMap(doc: Document, pageName: string): YAMLMap | null {
    const pages = pagesSeq(doc);
    if (!pages) {
        return null;
    }
    const match = pages.items.find((item) => isMap(item) && item.get("name") === pageName);
    return isMap(match) ? match : null;
}

export function elementsSeq(doc: Document, pageName: string): YAMLSeq | null {
    const page = pageMap(doc, pageName);
    if (!page) {
        return null;
    }
    const elements = page.get("elements");
    return isSeq(elements) ? elements : null;
}

function elementQuestionName(item: unknown): string | null {
    const question = isMap(item) ? item.get("question") : undefined;
    return typeof question === "string" ? question : null;
}

export function readPages(
    docs: ConfigDocs,
    formPath: string,
): {name: string; title: LocalText | null}[] {
    const pages = pagesSeq(requireDoc(docs, formPath));
    if (!pages) {
        return [];
    }
    return pages.items.filter(isMap).map((page) => {
        const title = page.get("title");
        return {
            name: String(page.get("name") ?? ""),
            title:
                title === undefined || title === null
                    ? null
                    : readLocalText(isMap(title) ? title.toJSON() : title),
        };
    });
}

/** Ensure the form has a pages sequence to append to, creating one when it has none yet. */
function pagesCollection(doc: Document): YAMLSeq {
    const existing = pagesSeq(doc);
    if (existing) {
        return existing;
    }
    const created = doc.createNode([]) as YAMLSeq;
    doc.set("pages", created);
    return created;
}

export function addPage(
    docs: ConfigDocs,
    formPath: string,
    titleNl: string,
): {name: string; touched: string[]} {
    const doc = requireDoc(docs, formPath);
    const taken = new Set(readPages(docs, formPath).map((page) => page.name));
    const name = uniqueInternalName(titleNl, taken);
    pagesCollection(doc).add(
        doc.createNode({name, title: {en: titleNl, nl: titleNl}, elements: []}),
    );
    return {name, touched: [formPath]};
}

/** Remove a page and discard any unsaved questions that were only used there. */
export function deletePage(docs: ConfigDocs, formPath: string, pageName: string): string[] {
    const pages = pagesSeq(requireDoc(docs, formPath));
    const index =
        pages?.items.findIndex((item) => isMap(item) && item.get("name") === pageName) ?? -1;
    if (!pages || index === -1) {
        return [];
    }
    const questions = elementsSeq(requireDoc(docs, formPath), pageName)?.items ?? [];
    pages.delete(index);
    return [
        formPath,
        ...discardUnusedNewQuestions(docs, formPath, questions.map(elementQuestionName)),
    ];
}

export function updatePageTitle(
    docs: ConfigDocs,
    formPath: string,
    pageName: string,
    language: "en" | "nl",
    value: string,
): string[] {
    const page = pageMap(requireDoc(docs, formPath), pageName);
    if (!page) {
        return [];
    }
    setLocalized(page, "title", language, value);
    return [formPath];
}

/** Locate a property by name along the inheritance chain, nearest definition first. */
export function findProperty(
    docs: ConfigDocs,
    definitionFolder: string,
    name: string,
): {node: YAMLMap; path: string; ownerFolder: string; key?: Scalar} | null {
    for (const folder of definitionChain(docs, definitionFolder)) {
        for (const path of propertyFilePaths(docs, folder)) {
            const properties = docs.get(path)?.get("properties");
            if (isSeq(properties)) {
                const match = properties.items.find(
                    (item) => isMap(item) && item.get("name") === name,
                );
                if (isMap(match)) {
                    return {node: match, path, ownerFolder: folder};
                }
            }
            if (isMap(properties)) {
                const match = properties.items.find(
                    (item) => isScalar(item.key) && item.key.value === name && isMap(item.value),
                );
                if (match && isScalar(match.key) && isMap(match.value)) {
                    return {node: match.value, path, ownerFolder: folder, key: match.key};
                }
            }
        }
    }
    return null;
}

function readChoices(values: unknown): EditorChoice[] {
    if (!isSeq(values)) {
        return [];
    }
    return values.items.filter(isMap).map((choice) => ({
        name: String(choice.get("name") ?? ""),
        text: readLocalText(choice.toJSON().text),
    }));
}

export function readQuestions(
    docs: ConfigDocs,
    formPath: string,
    pageName: string,
): EditorQuestion[] {
    const definitionFolder = definitionFolderOf(formPath);
    const elements = elementsSeq(requireDoc(docs, formPath), pageName);
    if (!elements) {
        return [];
    }

    return elements.items
        .map((item) => elementQuestionName(item))
        .filter((name): name is string => name !== null)
        .map((name) => {
            const found = findProperty(docs, definitionFolder, name);

            // A field pointing at a property that does not exist would make the parser throw. Show it as an
            // unknown row so the editor stays usable and the problem is visible.
            if (!found) {
                return {
                    name,
                    kind: "Unknown" as const,
                    rawType: "",
                    isRequired: false,
                    text: EMPTY_TEXT,
                    description: EMPTY_TEXT,
                    choices: [],
                    definedIn: "",
                    isInherited: false,
                    advancedKeys: [],
                    raw: {},
                };
            }

            const raw = (found.node.toJSON() ?? {}) as Record<string, unknown> & {
                type?: string;
                control?: unknown;
                values?: unknown;
                text?: unknown;
                description?: unknown;
            };
            const shared =
                raw.type && raw.values === undefined
                    ? findValueSet(
                          docs,
                          definitionFolder,
                          parseTypeString(raw.type).underlying,
                      )?.get("values")
                    : undefined;
            const sharedValues = isSeq(shared) ? shared.toJSON() : undefined;

            return {
                name,
                kind: kindOf(sharedValues ? {...raw, values: sharedValues} : raw),
                rawType: raw.type ?? "",
                isRequired: raw.type ? parseTypeString(raw.type).isRequired : false,
                text: readLocalText(raw.text),
                description: readLocalText(raw.description),
                choices: readChoices(shared ?? found.node.get("values")),
                usesSharedChoices: sharedValues !== undefined,
                definedIn: found.path,
                isInherited: found.ownerFolder !== definitionFolder,
                advancedKeys: ADVANCED_KEYS.filter((key) => raw[key] != null),
                raw: sharedValues ? {...raw, values: sharedValues} : raw,
            };
        });
}

/**
 * Property keys the visual editor has no controls for. Editing one of these blind is how a
 * coordinator silently breaks a condition, so a question carrying any of them opens in yaml mode.
 */
const ADVANCED_KEYS = [
    "condition",
    "validation",
    "onSave",
    "calculation",
    "subProperties",
    "rubric",
    "sources",
    "results",
    "filter",
    "visibility",
    "inheritedRoles",
];

export type EditorMode = "visual" | "yaml";

/** Why a question cannot use the visual editor, or null when it can. */
export type YamlOnlyReason = "missing" | "unsupported" | "advanced" | null;

export function yamlOnlyReason(question: EditorQuestion): YamlOnlyReason {
    if (question.definedIn === "") {
        return "missing";
    }
    if (question.kind === "Unknown") {
        return "unsupported";
    }
    return question.advancedKeys.length > 0 ? "advanced" : null;
}

export type ReadOnlyReason = "missing" | "unsupported" | "inherited" | null;

/**
 * Why a question cannot be edited here. A missing or unsupported property stays uneditable even in
 * its own file, so those outrank inheritance. An empty definedIn is the not-found sentinel above.
 */
export function readOnlyReason(question: EditorQuestion): ReadOnlyReason {
    if (question.kind === "Unknown") {
        return question.definedIn === "" ? "missing" : "unsupported";
    }
    return question.isInherited ? "inherited" : null;
}

export type QuestionPatch = {
    textNl?: string;
    textEn?: string;
    descriptionNl?: string;
    descriptionEn?: string;
    isRequired?: boolean;
    isArray?: boolean;
    allowedTypes?: string;
    maximumSize?: string;
    control?: string | null;
    /** Whole numbers and decimals are one kind, told apart by Int against Double. */
    isDecimal?: boolean;
    allowsExternalUsers?: boolean;
    name?: string;
};

/** Ensure doc has properties to append to, creating a sequence when the file has none yet. */
function propertiesCollection(doc: Document): YAMLSeq | YAMLMap {
    const existing = doc.get("properties");
    if (isSeq(existing) || isMap(existing)) {
        return existing;
    }
    const created = doc.createNode([]) as YAMLSeq;
    newPropertyCollections.set(created, doc.get("properties", true));
    doc.set("properties", created);
    return created;
}

export function addQuestion(
    docs: ConfigDocs,
    formPath: string,
    pageName: string,
    kind: QuestionKind,
    textNl: string,
): {name: string; touched: string[]} {
    const definitionFolder = definitionFolderOf(formPath);
    const name = uniqueInternalName(textNl, unavailableNames(docs, definitionFolder));
    const formDoc = requireDoc(docs, formPath);
    const elements = elementsSeq(formDoc, pageName);
    if (!elements) {
        throw new Error(`Page not found or has no elements list: ${pageName}`);
    }
    const targetPath = propertyTargetFile(docs, definitionFolder);
    const targetDoc = requireDoc(docs, targetPath);
    const definition = targetDoc.createNode(
        newPropertyValue(kind, name, {en: textNl, nl: textNl}),
    ) as YAMLMap;
    const properties = propertiesCollection(targetDoc);
    if (isMap(properties)) {
        definition.delete("name");
        properties.set(name, definition);
    } else {
        properties.add(definition);
    }
    newQuestionDefinitions.add(definition);

    elements.add(formDoc.createNode({question: name}));

    return {name, touched: [targetPath, formPath]};
}

/** Swap kinds, preserving common fields and removing settings unsupported by the new kind. */
export async function changeQuestionKind(
    docs: ConfigDocs,
    formPath: string,
    name: string,
    kind: QuestionKind,
): Promise<string[]> {
    const found = requireProperty(docs, formPath, name);
    const doc = requireDoc(docs, found.path);
    const {isRequired, underlying: previousType} = parseTypeString(
        String(found.node.get("type") ?? ""),
    );
    const next = newPropertyValue(kind, name, EMPTY_TEXT) as {
        type: string;
        control?: unknown;
        values?: unknown;
    };
    const {underlying, isArray} = parseTypeString(next.type);
    if (next.values && !found.node.has("values")) {
        const shared = findValueSet(docs, definitionFolderOf(formPath), previousType)?.get(
            "values",
        );
        if (isSeq(shared)) next.values = shared.toJSON();
    }
    const schema = await loadSchema("PropertyDefinition");
    if (!schema) throw new Error("Could not load the property schema");
    // A choice and a reference can have the same type constraint.
    const properties = (schema.anyOf ?? schema.oneOf ?? [schema])
        .map((branch) => flatten({anyOf: [branch]}, schema, 0, next).properties ?? {})
        .find((fields) => Object.keys(next).every((key) => key in fields));
    if (!properties) throw new Error("No property schema matches the new question type");

    found.node.set("type", buildTypeString(underlying, {isRequired, isArray}));
    for (const {key} of [...found.node.items]) {
        if (isScalar(key) && typeof key.value === "string" && !(key.value in properties)) {
            found.node.delete(key.value);
        }
    }
    for (const key of ["control", "values"] as const) {
        if (next[key] === undefined) {
            found.node.delete(key);
        } else if (key === "values" && found.node.has("values")) {
            // Keep choices the user already typed when moving between the two choice kinds.
            continue;
        } else {
            found.node.set(key, doc.createNode(next[key]));
        }
    }

    return [found.path];
}

/**
 * Copy an inherited property into this definition so it becomes editable here. Overriding by name is
 * what the config already does by hand, e.g. Projects/Project redeclaring Project-Base's Reviewer.
 */
export function overrideProperty(docs: ConfigDocs, formPath: string, name: string): string[] {
    const definitionFolder = definitionFolderOf(formPath);
    const found = findProperty(docs, definitionFolder, name);
    if (!found) {
        throw new Error(`Property not found: ${name}`);
    }
    if (found.ownerFolder === definitionFolder) {
        return [];
    }

    const targetPath = propertyTargetFile(docs, definitionFolder);
    const targetDoc = requireDoc(docs, targetPath);
    // Round-tripping through text is the cheapest deep copy that also keeps the comments.
    const parsedCopy = parseDocument(nodeToYaml(found.node)).contents;
    if (!isMap(parsedCopy)) {
        throw new Error(`Property ${name} is not a mapping`);
    }
    const copy = parsedCopy as YAMLMap;
    copy.commentBefore = ` Overrides ${found.ownerFolder}`;

    const properties = propertiesCollection(targetDoc);
    if (isMap(properties)) {
        copy.delete("name");
        properties.set(name, copy);
    } else {
        if (!copy.has("name")) {
            copy.set("name", name);
        }
        properties.add(copy);
    }

    return [targetPath];
}

/** Every page in the definition tree that lists this property, so deleting it can be honest. */
export function countFieldUsages(
    docs: ConfigDocs,
    formPath: string,
    name: string,
): {path: string; page: string}[] {
    const owner = findProperty(docs, definitionFolderOf(formPath), name)?.ownerFolder;
    if (!owner) {
        return [];
    }
    return definitionsInheritingFrom(docs, owner).flatMap((folder) =>
        listFormPaths(docs, folder).flatMap((path) =>
            readPages(docs, path)
                .filter((page) =>
                    elementsSeq(requireDoc(docs, path), page.name)?.items.some(
                        (item) => elementQuestionName(item) === name,
                    ),
                )
                .map((page) => ({path, page: page.name})),
        ),
    );
}

/** Delete the property itself plus every question-type element reference to it. */
export function deleteProperty(docs: ConfigDocs, formPath: string, name: string): string[] {
    const found = requireProperty(docs, formPath, name);
    const touched = new Set<string>([found.path]);

    for (const {path, page} of countFieldUsages(docs, formPath, name)) {
        const elements = elementsSeq(requireDoc(docs, path), page);
        const index = elements?.items.findIndex((item) => elementQuestionName(item) === name) ?? -1;
        if (elements && index !== -1) {
            elements.delete(index);
            touched.add(path);
        }
    }

    deletePropertyDefinition(docs, found, name);
    return [...touched];
}

function deletePropertyDefinition(
    docs: ConfigDocs,
    {path, node}: {path: string; node: YAMLMap},
    name: string,
) {
    const doc = requireDoc(docs, path);
    const properties = doc.get("properties");
    if (isSeq(properties)) {
        const index = properties.items.indexOf(node);
        if (index !== -1) properties.delete(index);
        if (properties.items.length === 0 && newPropertyCollections.has(properties)) {
            const replaced = newPropertyCollections.get(properties);
            if (replaced === undefined) doc.delete("properties");
            else doc.set("properties", replaced);
        }
    } else if (isMap(properties)) {
        properties.delete(name);
    }
}

function discardUnusedNewQuestions(docs: ConfigDocs, formPath: string, names: (string | null)[]) {
    const folder = definitionFolderOf(formPath);
    const touched = new Set<string>();
    for (const name of new Set(names)) {
        if (name === null) continue;
        const found = findProperty(docs, folder, name);
        if (
            found?.ownerFolder === folder &&
            newQuestionDefinitions.has(found.node) &&
            countFieldUsages(docs, formPath, name).length === 0
        ) {
            deletePropertyDefinition(docs, found, name);
            touched.add(found.path);
        }
    }
    return [...touched];
}

/** Every definition folder whose inheritance chain reaches the given folder, itself included. */
function definitionsInheritingFrom(docs: ConfigDocs, definitionFolder: string): string[] {
    return listDefinitionFolders(docs).filter((folder) =>
        definitionChain(docs, folder).includes(definitionFolder),
    );
}

function renameProperty(
    docs: ConfigDocs,
    definitionFolder: string,
    from: string,
    to: string,
): string[] {
    const found = validateRename(docs, definitionFolder, from, to);
    const affectedFolders = definitionsInheritingFrom(docs, found.ownerFolder).filter(
        (folder) => findProperty(docs, folder, from)?.ownerFolder === found.ownerFolder,
    );
    if (found.key) {
        found.key.value = to;
    } else {
        found.node.set("name", to);
    }

    const type = found.node.get("type");
    if (typeof type === "string" && parseTypeString(type).underlying === from) {
        const {isRequired, isArray} = parseTypeString(type);
        found.node.set("type", buildTypeString(to, {isRequired, isArray}));
    }

    const touched = new Set<string>([found.path]);
    for (const folder of affectedFolders) {
        for (const path of listFormPaths(docs, folder)) {
            const doc = requireDoc(docs, path);
            for (const page of readPages(docs, path)) {
                const elements = elementsSeq(doc, page.name);
                elements?.items.forEach((item) => {
                    if (isMap(item) && item.get("question") === from) {
                        item.set("question", to);
                        touched.add(path);
                    }
                });
            }
        }
    }

    return [...touched];
}

function localPropertyExists(docs: ConfigDocs, definitionFolder: string, name: string): boolean {
    return propertyFilePaths(docs, definitionFolder).some((path) => {
        const properties = docs.get(path)?.get("properties");
        if (isSeq(properties)) {
            return properties.items.some((item) => isMap(item) && item.get("name") === name);
        }
        return isMap(properties) && properties.has(name);
    });
}

function validateRename(
    docs: ConfigDocs,
    definitionFolder: string,
    from: string,
    to: string,
): {node: YAMLMap; path: string; ownerFolder: string; key?: Scalar} {
    if (unavailableNames(docs, definitionFolder).has(to)) {
        throw new Error(`The name ${to} is already in use in this workflow definition`);
    }

    const found = findProperty(docs, definitionFolder, from);
    if (!found) {
        throw new Error(`Property not found: ${from}`);
    }
    if (
        definitionsInheritingFrom(docs, found.ownerFolder).some(
            (folder) => folder !== found.ownerFolder && localPropertyExists(docs, folder, to),
        )
    ) {
        throw new Error(`The name ${to} is already in use in this workflow definition`);
    }
    return found;
}

function setLocalized(node: YAMLMap, key: string, language: "en" | "nl", value: string): void {
    const current = node.get(key);
    if (isMap(current)) {
        current.set(language, value);
        return;
    }
    if (current && typeof current === "object") {
        node.set(key, {...current, [language]: value});
        return;
    }
    const existing = typeof current === "string" ? current : "";
    node.set(key, {
        en: language === "en" ? value : existing,
        nl: language === "nl" ? value : existing,
    });
}

function valuesSeq(node: YAMLMap, doc: Document): YAMLSeq {
    const existing = node.get("values");
    if (isSeq(existing)) {
        return existing;
    }
    const created = doc.createNode([]) as YAMLSeq;
    node.set("values", created);
    return created;
}

function requireProperty(docs: ConfigDocs, formPath: string, questionName: string) {
    const found = findProperty(docs, definitionFolderOf(formPath), questionName);
    if (!found) {
        throw new Error(`Property not found: ${questionName}`);
    }
    return found;
}

export function addChoice(
    docs: ConfigDocs,
    formPath: string,
    questionName: string,
    textNl: string,
): string[] {
    const found = requireProperty(docs, formPath, questionName);
    const doc = requireDoc(docs, found.path);
    const values = valuesSeq(found.node, doc);
    const taken = new Set<string>();
    for (const item of values.items) {
        if (isMap(item)) {
            taken.add(String(item.get("name") ?? ""));
        }
    }
    const name = uniqueInternalName(textNl, taken);
    values.add(doc.createNode({name, text: {en: textNl, nl: textNl}}));
    return [found.path];
}

export function updateChoice(
    docs: ConfigDocs,
    formPath: string,
    questionName: string,
    choiceName: string,
    textNl: string,
): string[] {
    const found = requireProperty(docs, formPath, questionName);
    const values = found.node.get("values");
    if (!isSeq(values)) {
        return [];
    }
    const choice = values.items.find((item) => isMap(item) && item.get("name") === choiceName);
    if (!isMap(choice)) {
        return [];
    }
    setLocalized(choice, "text", "nl", textNl);
    return [found.path];
}

export function removeChoice(
    docs: ConfigDocs,
    formPath: string,
    questionName: string,
    choiceName: string,
): string[] {
    const found = requireProperty(docs, formPath, questionName);
    const values = found.node.get("values");
    if (!isSeq(values)) {
        return [];
    }
    const index = values.items.findIndex((item) => isMap(item) && item.get("name") === choiceName);
    if (index === -1) {
        return [];
    }
    values.delete(index);
    return [found.path];
}

export function updateQuestion(
    docs: ConfigDocs,
    formPath: string,
    name: string,
    patch: QuestionPatch,
): string[] {
    const definitionFolder = definitionFolderOf(formPath);
    if (patch.name !== undefined && patch.name !== name) {
        validateRename(docs, definitionFolder, name, patch.name);
    }
    const found = findProperty(docs, definitionFolder, name);
    if (!found) {
        throw new Error(`Property not found: ${name}`);
    }

    const touched = new Set<string>();

    if (patch.textNl !== undefined) {
        setLocalized(found.node, "text", "nl", patch.textNl);
        touched.add(found.path);
    }
    if (patch.textEn !== undefined) {
        setLocalized(found.node, "text", "en", patch.textEn);
        touched.add(found.path);
    }
    if (patch.descriptionNl !== undefined) {
        setLocalized(found.node, "description", "nl", patch.descriptionNl);
        touched.add(found.path);
    }
    if (patch.descriptionEn !== undefined) {
        setLocalized(found.node, "description", "en", patch.descriptionEn);
        touched.add(found.path);
    }
    if (patch.isRequired !== undefined || patch.isArray !== undefined) {
        const type = parseTypeString(
            String(found.node.get("type") ?? (patch.isRequired !== undefined ? "String" : "File")),
        );
        found.node.set(
            "type",
            buildTypeString(type.underlying, {
                isRequired: patch.isRequired ?? type.isRequired,
                isArray: patch.isArray ?? type.isArray,
            }),
        );
        touched.add(found.path);
    }
    if (patch.allowedTypes !== undefined) {
        const types = patch.allowedTypes
            .split(",")
            .map((type) => type.trim())
            .filter(Boolean);
        if (types.length) found.node.set("allowedTypes", types);
        else found.node.delete("allowedTypes");
        touched.add(found.path);
    }
    if (patch.maximumSize !== undefined) {
        const size = Number(patch.maximumSize);
        if (Number.isInteger(size) && size > 0) found.node.set("maximumSize", size);
        else found.node.delete("maximumSize");
        touched.add(found.path);
    }
    if (patch.control !== undefined) {
        if (patch.control === null) found.node.delete("control");
        else found.node.set("control", patch.control);
        touched.add(found.path);
    }
    if (patch.isDecimal !== undefined) {
        const {isRequired, isArray} = parseTypeString(String(found.node.get("type") ?? "Int"));
        found.node.set(
            "type",
            buildTypeString(patch.isDecimal ? "Double" : "Int", {isRequired, isArray}),
        );
        touched.add(found.path);
    }
    if (patch.allowsExternalUsers !== undefined) {
        // Absent means false to the parser, so drop the key rather than writing a redundant one.
        if (patch.allowsExternalUsers) {
            found.node.set("allowsExternalUsers", true);
        } else {
            found.node.delete("allowsExternalUsers");
        }
        touched.add(found.path);
    }
    if (patch.name !== undefined && patch.name !== name) {
        for (const path of renameProperty(docs, definitionFolder, name, patch.name)) {
            touched.add(path);
        }
    }

    return [...touched];
}

export function removeField(
    docs: ConfigDocs,
    formPath: string,
    pageName: string,
    name: string,
): string[] {
    const elements = elementsSeq(requireDoc(docs, formPath), pageName);
    if (!elements) {
        return [];
    }
    const index = elements.items.findIndex((item) => elementQuestionName(item) === name);
    if (index === -1) {
        return [];
    }
    elements.delete(index);
    return [formPath, ...discardUnusedNewQuestions(docs, formPath, [name])];
}

export function isSortableElement(item: unknown): item is YAMLMap {
    return (
        isMap(item) &&
        (elementQuestionName(item) !== null ||
            item.get("text") != null ||
            isMap(item.get("callout")))
    );
}

export function reorderElements(
    docs: ConfigDocs,
    formPath: string,
    pageName: string,
    from: number,
    to: number,
): string[] {
    if (from === to || from < 0 || to < 0 || !Number.isInteger(from) || !Number.isInteger(to)) {
        return [];
    }
    const elements = elementsSeq(requireDoc(docs, formPath), pageName);
    if (!elements) {
        return [];
    }
    const positions = elements.items.flatMap((item, index) =>
        isSortableElement(item) ? [index] : [],
    );
    if (from >= positions.length || to >= positions.length) {
        return [];
    }
    const movable = positions.map((index) => elements.items[index]);
    const [moved] = movable.splice(from, 1);
    movable.splice(to, 0, moved);
    positions.forEach((position, index) => {
        elements.items[position] = movable[index];
    });
    return [formPath];
}
