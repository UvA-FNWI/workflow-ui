import type {LocalString} from "~/hooks/useTranslate";

export type Submission = {
    id: string;
    dateSubmitted?: string;
    permissions: RoleAction[];
    answers: Answer[];
    form: Form;
};

export type Answer = {
    id: string;
    questionName: string;
    value: unknown;
    isVisible: boolean;
    validationError?: LocalString;
    visibleChoices?: string[];
    files: StoredFile[];
};

export type StoredFile = {
    id: string;
    name: string;
    accessToken: string;
};

export type Form = {
    name: string;
    title: LocalString;
    pages: Page[];
    step?: string;
};

export type Page = {
    index: number;
    title: LocalString;
    introduction?: LocalString;
    layout: PageLayout;
    questions: Question[];
};

export type Question = {
    name: string;
    type: DataType;
    text: LocalString;
    description?: LocalString;
    isRequired: boolean;
    isArray: boolean;
    choices: Choice[];
    workflowDefinition?: string;
    hideInResults: boolean;
    shortText?: LocalString;
    layout?: StringLayoutOptions | ChoiceLayoutOptions;
};

export type StringLayoutOptions = {
    allowAttachments: boolean;
    multiline: boolean;
};

export type ChoiceLayoutOptions = {
    type: ChoiceLayoutType;
};

export type Choice = {
    name: string;
    description?: LocalString;
    text: LocalString;
};

export type PageLayout = "Normal" | "Condensed";
export type RoleAction = "ViewAdminTools" | "View" | "Edit" | "Submit";
export type DataType =
    | "File"
    | "Date"
    | "DateTime"
    | "User"
    | "Choice"
    | "Currency"
    | "Table"
    | "String"
    | "Double"
    | "Reference"
    | "Int";
export type ChoiceLayoutType = "Dropdown" | "RadioList";
