import type {LocalText, QuestionKind} from "~/components/FormEditor/model/types";

export const QUESTION_KINDS: readonly QuestionKind[] = [
    "Document",
    "TextField",
    "LongText",
    "Date",
    "SingleChoice",
    "MultipleChoice",
] as const;

/** Mirrors UnderlyingType, IsRequired and IsArray on the C# PropertyDefinition. */
export function parseTypeString(type: string): {
    underlying: string;
    isRequired: boolean;
    isArray: boolean;
} {
    return {
        underlying: type.replace(/^\[/, "").replace(/[\]!]+$/, ""),
        isRequired: type.endsWith("!"),
        isArray: type.startsWith("["),
    };
}

export function buildTypeString(
    underlying: string,
    {isRequired, isArray}: {isRequired: boolean; isArray: boolean},
): string {
    const inner = isArray ? `[${underlying}]` : underlying;
    return isRequired ? `${inner}!` : inner;
}

type RawProperty = {
    type?: string;
    layout?: {multiline?: boolean; type?: string} | null;
    values?: unknown;
};

/**
 * Which palette button a property came from. Anything outside the six supported kinds is "Unknown"
 * and the editor shows it read-only rather than guessing.
 */
export function kindOf(raw: RawProperty): QuestionKind | "Unknown" {
    if (typeof raw.type !== "string") {
        return "Unknown";
    }
    const {underlying, isArray} = parseTypeString(raw.type);

    // A choice question is any type carrying inline values. The engine reaches DataType.Choice only
    // when the type name matches no ValueSet and no entity type, which names.ts guards on write.
    if (Array.isArray(raw.values)) {
        return isArray ? "MultipleChoice" : "SingleChoice";
    }
    if (isArray) {
        return "Unknown";
    }

    switch (underlying) {
        case "File":
            return "Document";
        case "Date":
            return "Date";
        case "String":
            return raw.layout?.multiline === true ? "LongText" : "TextField";
        default:
            return "Unknown";
    }
}

/** The plain object written into a properties list for a newly added question. */
export function newPropertyValue(
    kind: QuestionKind,
    name: string,
    text: LocalText,
): Record<string, unknown> {
    switch (kind) {
        case "Document":
            return {name, type: "File", text};
        case "TextField":
            return {name, type: "String", text};
        case "LongText":
            return {name, type: "String", text, layout: {multiline: true}};
        case "Date":
            return {name, type: "Date", text};
        case "SingleChoice":
            return {
                name,
                type: name,
                text,
                values: [{name: "Option1", text: {en: "Option 1", nl: "Optie 1"}}],
                layout: {type: "RadioList"},
            };
        case "MultipleChoice":
            return {
                name,
                type: `[${name}]`,
                text,
                values: [{name: "Option1", text: {en: "Option 1", nl: "Optie 1"}}],
            };
    }
}
