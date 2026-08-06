import type {LocalText, QuestionKind} from "~/components/FormEditor/model/types";

export const QUESTION_KINDS: readonly QuestionKind[] = [
    "TextField",
    "LongText",
    "Email",
    "Phone",
    "Number",
    "Decimal",
    "Date",
    "YesNo",
    "SingleChoice",
    "MultipleChoice",
    "Person",
    "People",
    "Document",
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
    layout?: {multiline?: boolean; type?: string; variant?: string} | null;
    values?: unknown;
};

/**
 * Which palette entry a property came from. Anything outside the supported kinds is "Unknown" and the
 * editor falls back to yaml rather than guessing.
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
    // User is the one non-choice type the runtime renders as an array, via UserPicker's multiple mode.
    if (isArray) {
        return underlying === "User" ? "People" : "Unknown";
    }

    switch (underlying) {
        case "File":
            return "Document";
        case "Date":
            return "Date";
        case "Int":
            return "Number";
        case "Double":
            return "Decimal";
        case "Boolean":
            return "YesNo";
        case "User":
            return "Person";
        case "String":
            if (raw.layout?.variant === "Email") {
                return "Email";
            }
            if (raw.layout?.variant === "Phone") {
                return "Phone";
            }
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
        case "Email":
            return {name, type: "String", text, layout: {variant: "Email"}};
        case "Phone":
            return {name, type: "String", text, layout: {variant: "Phone"}};
        case "Number":
            return {name, type: "Int", text};
        case "Decimal":
            return {name, type: "Double", text};
        case "YesNo":
            return {name, type: "Boolean", text};
        case "Person":
            return {name, type: "User", text};
        case "People":
            return {name, type: "[User]", text};
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
