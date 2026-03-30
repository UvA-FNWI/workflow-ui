export type AssessmentGroup = {
    id: string;
    forms: Assessment[];
};

export type Assessment = {
    id: string;
    results: Record<string, Result[]>;
    weightedAverages: Record<string, number>;
};

export type Result = {
    questionName: string;
    weight: number;
    percentage: number;
    answer: number;
};
