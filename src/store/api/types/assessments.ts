import type {LocalString} from "~/hooks/useTranslate.ts";
import type {Answer} from "~/store/api/types/submissions.ts";

export type AssessmentGroup = {
    id: string;
    forms: Assessment[];
};

export type Assessment = {
    id: string;
    formTitle: LocalString;
    results: Record<string, Result[]>;
    weightedAverages: Record<string, number>;
    answers: Answer[];
};

export type Result = {
    questionName: string;
    weight: number;
    percentage: number;
    answer: number;
};
