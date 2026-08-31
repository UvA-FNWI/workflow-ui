import type {Document} from "yaml";

/** Every config file, parsed. Keys are repo-root-relative paths, exactly as the API returns them. */
export type ConfigDocs = Map<string, Document>;

/**
 * The question kinds that map cleanly onto engine types. The ceiling is InputControl: anything it
 * falls through to "Not supported type..." for stays out, and is edited as yaml instead.
 */
export const QUESTION_KINDS = [
    "TextField",
    "Email",
    "Phone",
    "Number",
    "Date",
    "YesNo",
    "SingleChoice",
    "MultipleChoice",
    "Person",
    "People",
    "Document",
] as const;

export type QuestionKind = (typeof QUESTION_KINDS)[number];

export type LocalText = {en: string; nl: string};

export type EditorChoice = {
    name: string;
    text: LocalText;
};

export type EditorQuestion = {
    /** Internal name, the key in the properties list and the value in a page's fields list. */
    name: string;
    /** "Unknown" for anything outside the supported kinds, which falls back to yaml. */
    kind: QuestionKind | "Unknown";
    /** The raw type string, e.g. "String!" or "[User]". */
    rawType: string;
    isRequired: boolean;
    text: LocalText;
    description: LocalText;
    choices: EditorChoice[];
    /** Path of the file the property is defined in. */
    definedIn: string;
    /** True when the property comes from an ancestor definition and must not be edited here. */
    isInherited: boolean;
    /**
     * Keys present on the property that the visual editor does not model. Any of these forces the
     * question into yaml mode, the way Home Assistant refuses a card its visual editor can't express.
     */
    advancedKeys: string[];
    /** The whole property as plain JSON, for the preview mapper and the yaml-mode header. */
    raw: Record<string, unknown>;
};
