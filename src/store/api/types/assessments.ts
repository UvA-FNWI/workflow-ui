import type {LocalString} from "~/hooks/useTranslate.ts";
import type {Answer} from "~/store/api/types/submissions.ts";

export type Assessment = {
    id: string;
    parts: AssessmentPart[];
    finalGrade: number;
};

export type AssessmentPart = {
    id: string;
    sourceTitle: LocalString;
    sourceResults: SourceResult;
    //    weightedAverages: Record<string, number>;
    answers: Answer[];
};

export type SourceResult = {
    sourceName: string;
    score: number;
    pageResults: PageResult[];
};

export type PageResult = {
    pageName: string;
    weight: number;
    weightedAverage: number;
    questionResults: QuestionResult[];
};

export type QuestionResult = {
    questionName: string;
    weight: number;
    percentage: number;
    answer: number;
};
