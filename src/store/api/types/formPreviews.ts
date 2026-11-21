import type {LocalString} from "~/hooks/useTranslate";
import type {PageResult} from "~/store/api/types/assessments";
import type {Answer, Choice, Form} from "~/store/api/types/submissions";

export type PreviewableForm = {name: string; title: LocalString};

export type PreviewPageResult = Omit<PageResult, "weightedAverage"> & {
    weightedAverage: number | null;
    answeredCount: number;
    questionCount: number;
};

export type FormPreview = {
    formName: string;
    form: Form;
    answers: Answer[];
    referenceChoices: Record<string, Choice[]>;
    pageResults: PreviewPageResult[];
};
