import {type Document, isMap, isSeq, parseDocument} from "yaml";

import type {ConfigDocs} from "~/components/FormEditor/model/types";

const ENTITY_FILE = "Entity.yaml";

/** Parse every file into a Document. Non-yaml files (the mail layout) are kept aside by the caller. */
export function parseConfigDocs(files: Record<string, string>): ConfigDocs {
    const docs: ConfigDocs = new Map();
    for (const [path, content] of Object.entries(files)) {
        if (path.toLowerCase().endsWith(".yaml")) {
            docs.set(path, parseDocument(content));
        }
    }
    return docs;
}

export function serializeConfigDocs(docs: ConfigDocs): Record<string, string> {
    const files: Record<string, string> = {};
    for (const [path, doc] of docs) {
        files[path] = doc.toString();
    }
    return files;
}

function folderOf(path: string): string {
    return path.slice(0, path.lastIndexOf("/"));
}

/**
 * Any folder holding an Entity.yaml, matching ModelParser.GetWorkflowDefinitionFolders. Common is
 * skipped there, so it is skipped here.
 */
export function listDefinitionFolders(docs: ConfigDocs): string[] {
    return [...docs.keys()]
        .filter((path) => path.endsWith(`/${ENTITY_FILE}`))
        .map(folderOf)
        .filter((folder) => !folder.split("/").includes("Common"))
        .sort();
}

export function listFormPaths(docs: ConfigDocs, definitionFolder: string): string[] {
    const prefix = `${definitionFolder}/Forms/`;
    return [...docs.keys()]
        .filter((path) => path.startsWith(prefix) && !path.slice(prefix.length).includes("/"))
        .sort();
}

export function definitionFolderOf(formPath: string): string {
    return folderOf(folderOf(formPath));
}

function definitionName(docs: ConfigDocs, definitionFolder: string): string | null {
    const entity = docs.get(`${definitionFolder}/${ENTITY_FILE}`);
    const name = entity?.get("name");
    return typeof name === "string" ? name : null;
}

export function parentDefinitionFolder(docs: ConfigDocs, definitionFolder: string): string | null {
    const entity = docs.get(`${definitionFolder}/${ENTITY_FILE}`);
    const parent = entity?.get("inheritsFrom");
    if (typeof parent !== "string") {
        return null;
    }
    return listDefinitionFolders(docs).find((f) => definitionName(docs, f) === parent) ?? null;
}

/** The definition followed by each ancestor, nearest first. Properties resolve along this order. */
export function definitionChain(docs: ConfigDocs, definitionFolder: string): string[] {
    const chain: string[] = [];
    let current: string | null = definitionFolder;
    while (current !== null && !chain.includes(current)) {
        chain.push(current);
        current = parentDefinitionFolder(docs, current);
    }
    return chain;
}

/**
 * Files in the definition folder or its Steps folder that can carry a properties list. ModelParser
 * merges both into the workflow definition.
 */
export function propertyFilePaths(docs: ConfigDocs, definitionFolder: string): string[] {
    return [...docs.keys()]
        .filter((path) => {
            const folder = folderOf(path);
            return folder === definitionFolder || folder === `${definitionFolder}/Steps`;
        })
        .filter((path) => {
            const properties = docs.get(path)?.get("properties");
            return isSeq(properties) || isMap(properties);
        })
        .sort();
}

/** Where a newly added property is written: Properties.yaml if it exists, otherwise Entity.yaml. */
export function propertyTargetFile(docs: ConfigDocs, definitionFolder: string): string {
    const properties = `${definitionFolder}/Properties.yaml`;
    return docs.has(properties) ? properties : `${definitionFolder}/${ENTITY_FILE}`;
}

/** Convenience for callers that hold a path rather than a Document. */
export function requireDoc(docs: ConfigDocs, path: string): Document {
    const doc = docs.get(path);
    if (!doc) {
        throw new Error(`Config file not found: ${path}`);
    }
    return doc;
}
