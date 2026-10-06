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
    length: number;
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
    isActive: boolean;
};

export type QuestionBase = {
    name: string;
    text: LocalString;
    weight: number | null;
    percentage: number | null;
    isRequired: boolean;
    isArray: boolean;
    hideInResults: boolean;
    description?: LocalString | null;
    shortText?: LocalString | null;
    linkedTo?: string | null;
};

export type StringQuestion = QuestionBase & {
    type: "String";
    layout?: TextLayoutOptions | null;
    maxLength?: number | null;
    minLength?: number | null;
};

export type DateQuestion = QuestionBase & {
    type: "Date";
    isDeadline: boolean;
    /** Latest allowed calendar date (yyyy-MM-dd), supplied by the backend. */
    maxDate?: string | null;
};

export type DateTimeQuestion = QuestionBase & {
    type: "DateTime";
};

export type IntQuestion = QuestionBase & {
    type: "Int";
};

export type DoubleQuestion = QuestionBase & {
    type: "Double";
};

export type CheckQuestion = QuestionBase & {
    type: "Check";
};

export type CurrencyQuestion = QuestionBase & {
    type: "Currency";
};

export type FileQuestion = QuestionBase & {
    type: "File";
    allowedFileTypes: string[];
    /** Maximum file size in bytes. */
    allowedFileSize: number;
};

export type UserQuestion = QuestionBase & {
    type: "User";
    allowsExternalUsers: boolean;
};

export type ChoiceQuestion = QuestionBase & {
    type: "Choice";
    choices: Choice[];
    layout?: ChoiceLayoutOptions | null;
    rubric?: RubricEntry[] | null;
    sorting?: Sorting | null;
};

export type ReferenceQuestion = QuestionBase & {
    type: "Reference";
    workflowDefinition?: string | null;
    layout?: ChoiceLayoutOptions | null;
};

export type ObjectQuestion = QuestionBase & {
    type: "Object";
    workflowDefinition?: string | null;
    layout?: TableLayoutOptions | null;
    subProperties?: Question[] | null;
};

export type Question =
    | StringQuestion
    | DateQuestion
    | DateTimeQuestion
    | IntQuestion
    | DoubleQuestion
    | CheckQuestion
    | CurrencyQuestion
    | FileQuestion
    | UserQuestion
    | ChoiceQuestion
    | ReferenceQuestion
    | ObjectQuestion;

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
    allowAttachments?: boolean;
    multiline?: boolean;
    variant?: StringVariant | null;
};

export type ChoiceLayoutOptions = {
    type?: ChoiceLayoutType | null;
};

export type TableLayoutOptions = {
    type?: "InlineEditing" | "Modal" | null;
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
    | "CreateRelatedInstance"
    | "Undo"
    | "ViewCorrespondence";
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
