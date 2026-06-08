import type {LocalString} from "~/hooks/useTranslate";
import type {ApiErrorState} from "~/store/api/types/returnTypes.ts";

export type Submission = {
    id: string;
    dateSubmitted?: string;
    permissions: RoleAction[];
    answers: Answer[];
    form: Form;
};

export type EffectResult = {
    redirectUrl?: string;
    showConfetti?: boolean;
    toast?: ToastEffect;
    error?: ApiErrorState;
};

export type ToastEffect = {
    type: ToastType;
    message: LocalString;
};

export type ToastType = "Success" | "Error" | "Info" | "Warning" | "Note";

export type Answer = {
    id: string;
    questionName: string;
    value: unknown;
    isVisible: boolean;
    validationError?: LocalString;
    visibleChoices?: string[] | null;
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
    layout: FormLayout;
    pages: Page[];
    formType: FormType;
    step?: string;
};

export type Page = {
    index: number;
    name: string;
    title: LocalString;
    introduction?: LocalString;
    layout: PageLayout;
    questions: Question[];
    hasResults: boolean;
    isInCurrentForm: boolean;
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
    maxLength?: number;
    weight?: number;
    allowsExternalUsers: boolean;
    rubric?: RubricEntry[];
};

export type RubricEntry = {
    name: string;
    description: LocalString;
    grades: string[];
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
export type FormType = "Normal" | "AssessmentOverview";
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
    | "Int"
    | "Boolean"
    | "Object";
export type ChoiceLayoutType = "Dropdown" | "RadioList" | "Rubric";
export type FormLayout = "Normal" | "Compact" | "Modal";

export type ImpersonationRole = {
    name: string;
    title: LocalString;
};
