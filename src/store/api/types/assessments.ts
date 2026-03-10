export type Assessments = {
    id: string;
    results: Record<string, Result[]>;
    weightedAverages: Record<string, number>;
};

export type AssessmentPage = {
    id: string;
    pageName: string;
    results: Result[];
    weightedAverage: number;
};

export type Result = {
    questionName: string;
    weight: number;
    percentage: number;
    answer: number;
};
