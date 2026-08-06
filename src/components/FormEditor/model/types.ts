import type {Document} from "yaml";

/** Every config file, parsed. Keys are repo-root-relative paths, exactly as the API returns them. */
export type ConfigDocs = Map<string, Document>;

/** The six question kinds that map cleanly onto engine types today. */
export type QuestionKind =
    | "Document"
    | "TextField"
    | "LongText"
    | "Date"
    | "SingleChoice"
    | "MultipleChoice";

export type LocalText = {en: string; nl: string};

export type EditorChoice = {
    name: string;
    text: LocalText;
};

export type EditorQuestion = {
    /** Internal name, the key in the properties list and the value in a page's fields list. */
    name: string;
    /** "Unknown" for anything outside the six supported kinds, shown read-only. */
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
};
