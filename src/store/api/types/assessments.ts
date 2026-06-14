import type {LocalString} from "~/hooks/useTranslate.ts";
import type {Answer} from "~/store/api/types/submissions.ts";

export type Assessment = {
    id: string;
    parts: AssessmentPart[];
    finalGrade: number;
};

export type AssessmentPart = {
    id: string;
    title: LocalString;
    sourceResults: SourceResult[];
    combined: SourceResult | null;
    weightedAverage: number;
    percentage: number;
};

export type SourceResult = {
    id: string;
    title: LocalString;
    pageResults: PageResult[];
    answers: Answer[];
    weightedAverage: number;
    percentage: number;
};

export type PageResult = {
    name: string;
    weight: number;
    weightedAverage: number;
    questionResults: QuestionResult[];
    sum: number;
};

export type QuestionResult = {
    name: string;
    weight: number;
    percentage: number;
    answer: number;
};
