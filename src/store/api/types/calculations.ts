export type Calculations = {
    id: string;
    results: Record<string, Results[]>;
    weightedAverages: Record<string, number>;
};

export type Results = {
    questionName: string;
    weight: number;
    percentage: number;
    answer: number;
};
