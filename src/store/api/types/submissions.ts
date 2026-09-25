import type {LocalString} from "~/hooks/useTranslate";
import type {ApiErrorState} from "~/store/api/types/returnTypes.ts";

export type MessageVariant = "Success" | "Error" | "Info" | "Warning" | "Note";

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
    type: MessageVariant;
    message: LocalString;
};

export type AnswerChange = {
    value: unknown;
    changedAt: string;
    changedBy?: string | null;
};

export type AnswerChangeGroup = {
    versionNumber: number;
    isInProgress: boolean;
    changes: AnswerChange[];
};

export type Answer = {
    id: string;
    questionName: string;
    value: unknown;
    isVisible: boolean;
    validationError?: LocalString;
    visibleChoices?: string[] | null;
    files: StoredFile[];
    changes?: AnswerChangeGroup[] | null;
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
    step?: string;
};

export type Page = {
    index: number;
    name: string;
    title: LocalString;
    layout: PageLayout;
    elements: PageElement[];
    hasResults: boolean;
    isInCurrentForm: boolean;
};

export type Question = {
    name: string;
    type: DataType;
    text: LocalString;

    weight: number | null;
    percentage: number | null;

    isRequired: boolean;
    isArray: boolean;
    hideInResults: boolean;
    allowsExternalUsers: boolean;

    choices: Choice[];
    rubric?: RubricEntry[];

    description?: LocalString;
    shortText?: LocalString;
    workflowDefinition?: string;
    layout?: TextLayoutOptions | ChoiceLayoutOptions;
    maxLength?: number;
    minLength?: number;
    sorting?: Sorting;
    linkedTo?: string;
    allowedFileTypes?: string[];
    /** Maximum file size in bytes. */
    allowedFileSize?: number;
    /** Properties of an embedded object. */
    subProperties?: Question[] | null;
};

export type PageElementKind = "Question" | "Text" | "Callout";

export type PageElement = {
    kind: PageElementKind;
    question?: Question;
    callout?: Callout;
    text?: LocalString;
};

export type Callout = {
    variant: MessageVariant;
    title?: LocalString;
    text?: LocalString;
};

export type SortDirection = "Ascending" | "Descending";
export type ChoiceSortField = "Name" | "Text" | "Value" | "Description";

export type Sorting = {
    field: ChoiceSortField;
    direction: SortDirection;
};

export type RubricGrade = {
    name: string;
    text: LocalString;
};

export type RubricEntry = {
    name: string;
    description: LocalString;
    grades: RubricGrade[];
};

export type StringVariant = "Email" | "Phone";

export type TextLayoutOptions = {
    allowAttachments: boolean;
    multiline: boolean;
    variant?: StringVariant;
};

export type ChoiceLayoutOptions = {
    type: ChoiceLayoutType;
};

export type Choice = {
    name: string;
    description?: LocalString;
    text: LocalString;
    value?: number;
};

export type PageLayout = "Normal" | "Condensed";
export type StepResultsType = "Normal" | "AssessmentPartOverview" | "AssessmentFinalOverview";
export type RoleAction =
    | "ViewAdminTools"
    | "View"
    | "Edit"
    | "Submit"
    | "Execute"
    | "PostponeDeadlines"
    | "CreateRelatedInstance"
    | "ViewCorrespondence"
    | "Undo";
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
    | "Check"
    | "Object";
export type ChoiceLayoutType = "Dropdown" | "RadioList" | "Rubric" | "ComboBox";
export type FormLayout = "Normal" | "Compact" | "Modal";
