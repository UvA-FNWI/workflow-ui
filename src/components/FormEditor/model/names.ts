import {isMap, isScalar, isSeq} from "yaml";

import {
    definitionChain,
    listDefinitionFolders,
    propertyFilePaths,
} from "~/components/FormEditor/model/paths";
import type {ConfigDocs} from "~/components/FormEditor/model/types";

const MAX_NAME_LENGTH = 40;

/** PascalCase slug of the question text, e.g. "Aantal EC" becomes "AantalEC". */
export function toInternalName(text: string): string {
    return text
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
        .slice(0, MAX_NAME_LENGTH);
}

export function uniqueInternalName(text: string, taken: Set<string>): string {
    const name = toInternalName(text);
    const base = name || "Question";
    let counter = name ? 0 : 1;
    while (true) {
        const suffix = counter ? String(counter) : "";
        const candidate = `${base.slice(0, MAX_NAME_LENGTH - suffix.length)}${suffix}`;
        if (!taken.has(candidate)) {
            return candidate;
        }
        counter = counter ? counter + 1 : 2;
    }
}

function propertyNamesIn(docs: ConfigDocs, definitionFolder: string): string[] {
    return propertyFilePaths(docs, definitionFolder).flatMap((path) => {
        const properties = docs.get(path)?.get("properties");
        if (isSeq(properties)) {
            return properties.items
                .map((item) => (item as {get?: (key: string) => unknown}).get?.("name"))
                .filter((name): name is string => typeof name === "string");
        }
        if (isMap(properties)) {
            return properties.items.flatMap(({key}) =>
                isScalar(key) && typeof key.value === "string" ? [key.value] : [],
            );
        }
        return [];
    });
}

/** Names a new property must not take, including property, ValueSet, and entity names. */
export function unavailableNames(docs: ConfigDocs, definitionFolder: string): Set<string> {
    const names = new Set<string>();

    for (const folder of definitionChain(docs, definitionFolder)) {
        for (const name of propertyNamesIn(docs, folder)) {
            names.add(name);
        }
    }

    for (const [path, doc] of docs) {
        if (path.includes("/ValueSets/")) {
            const name = doc.get("name");
            if (typeof name === "string") {
                names.add(name);
            }
        }
    }

    for (const folder of listDefinitionFolders(docs)) {
        const name = docs.get(`${folder}/Entity.yaml`)?.get("name");
        if (typeof name === "string") {
            names.add(name);
        }
    }

    return names;
}
