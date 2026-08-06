import {type Document, isMap, isScalar, isSeq, type Scalar, type YAMLMap, type YAMLSeq} from "yaml";

import {unavailableNames, uniqueInternalName} from "~/components/FormEditor/model/names";
import {
    definitionChain,
    definitionFolderOf,
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
import type {
    ConfigDocs,
    EditorChoice,
    EditorQuestion,
    LocalText,
    QuestionKind,
} from "~/components/FormEditor/model/types";

const EMPTY_TEXT: LocalText = {en: "", nl: ""};

/** A bilingual field may be a plain string in yaml; normalize both shapes to LocalText. */
function readLocalText(value: unknown): LocalText {
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

function pagesSeq(doc: Document): YAMLSeq | null {
    const pages = doc.get("pages");
    return isSeq(pages) ? pages : null;
}

function pageMap(doc: Document, pageName: string): YAMLMap | null {
    const pages = pagesSeq(doc);
    if (!pages) {
        return null;
    }
    const match = pages.items.find((item) => isMap(item) && item.get("name") === pageName);
    return isMap(match) ? match : null;
}

export function fieldsSeq(doc: Document, pageName: string): YAMLSeq | null {
    const page = pageMap(doc, pageName);
    if (!page) {
        return null;
    }
    const fields = page.get("fields");
    return isSeq(fields) ? fields : null;
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

/** Locate a property by name along the inheritance chain, nearest definition first. */
function findProperty(
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

function readChoices(node: YAMLMap): EditorChoice[] {
    const values = node.get("values");
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
    const fields = fieldsSeq(requireDoc(docs, formPath), pageName);
    if (!fields) {
        return [];
    }

    return fields.items.map((item) => {
        const name = String((item as {value?: unknown}).value ?? item);
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
            };
        }

        const raw = found.node.toJSON() as {
            type?: string;
            layout?: {multiline?: boolean; type?: string} | null;
            values?: unknown;
            text?: unknown;
            description?: unknown;
        };

        return {
            name,
            kind: kindOf(raw),
            rawType: raw.type ?? "",
            isRequired: raw.type ? parseTypeString(raw.type).isRequired : false,
            text: readLocalText(raw.text),
            description: readLocalText(raw.description),
            choices: readChoices(found.node),
            definedIn: found.path,
            isInherited: found.ownerFolder !== definitionFolder,
        };
    });
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
    name?: string;
};

/** Ensure doc has properties to append to, creating a sequence when the file has none yet. */
function propertiesCollection(doc: Document): YAMLSeq | YAMLMap {
    const existing = doc.get("properties");
    if (isSeq(existing) || isMap(existing)) {
        return existing;
    }
    const created = doc.createNode([]) as YAMLSeq;
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
    const fields = fieldsSeq(formDoc, pageName);
    if (!fields) {
        throw new Error(`Page not found or has no fields list: ${pageName}`);
    }
    const targetPath = propertyTargetFile(docs, definitionFolder);
    const targetDoc = requireDoc(docs, targetPath);
    const value = newPropertyValue(kind, name, {en: textNl, nl: textNl});
    const properties = propertiesCollection(targetDoc);
    if (isMap(properties)) {
        const mappingValue = {...value};
        delete mappingValue.name;
        properties.set(name, targetDoc.createNode(mappingValue));
    } else {
        properties.add(targetDoc.createNode(value));
    }

    fields.add(formDoc.createNode(name));

    return {name, touched: [targetPath, formPath]};
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
                const fields = fieldsSeq(doc, page.name);
                fields?.items.forEach((item, index) => {
                    if (isScalar(item) && item.value === from) {
                        (item as Scalar).value = to;
                        touched.add(path);
                    } else if (item === from) {
                        fields.set(index, to);
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
    if (patch.isRequired !== undefined) {
        const type = String(found.node.get("type") ?? "String");
        const {underlying, isArray} = parseTypeString(type);
        found.node.set(
            "type",
            buildTypeString(underlying, {isRequired: patch.isRequired, isArray}),
        );
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
    const fields = fieldsSeq(requireDoc(docs, formPath), pageName);
    if (!fields) {
        return [];
    }
    const index = fields.items.findIndex((item) => (isScalar(item) ? item.value : item) === name);
    if (index === -1) {
        return [];
    }
    fields.delete(index);
    return [formPath];
}

export function reorderFields(
    docs: ConfigDocs,
    formPath: string,
    pageName: string,
    from: number,
    to: number,
): string[] {
    if (from === to || from < 0 || to < 0 || !Number.isInteger(from) || !Number.isInteger(to)) {
        return [];
    }
    const fields = fieldsSeq(requireDoc(docs, formPath), pageName);
    if (!fields) {
        return [];
    }
    if (from >= fields.items.length || to >= fields.items.length) {
        return [];
    }
    const [moved] = fields.items.splice(from, 1);
    fields.items.splice(to, 0, moved);
    return [formPath];
}
