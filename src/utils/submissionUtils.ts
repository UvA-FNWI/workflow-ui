import type {Assessment, Result} from "~/store/api/types/assessments.ts";
import type {Answer, Question} from "~/store/api/types/submissions.ts";

export type QuestionAnswerPair = {
    question: Question;
    answer: Answer | null;
    percentage: number | null;
};

export function getVisibleQuestionAnswerPairs(
    questions: Question[],
    answers: Answer[],
    percentages?: Result[],
): QuestionAnswerPair[] {
    return questions
        .filter((question) => !question.hideInResults)
        .map((question) => ({
            question,
            answer: answers.find((a) => a.questionName === question.name) ?? null,
            percentage:
                percentages?.find((p) => p.questionName === question.name)?.percentage ?? null,
        }))
        .filter((pair) => pair.answer?.isVisible !== false);
}

export function flattenPagesAndQuestions(data: Assessment[]): Record<string, Result[]> {
    return data.reduce<Record<string, Result[]>>((resultsPerPage, assessment) => {
        for (const [page, results] of Object.entries(assessment.results ?? {})) {
            const existingPageResults = resultsPerPage[page] ?? (resultsPerPage[page] = []);
            const existingQuestionIds = new Set(existingPageResults.map((q) => q.questionName));

            results.forEach((q) => {
                if (!existingQuestionIds.has(q.questionName)) {
                    existingPageResults.push({...q, answer: 0});
                }
            });
        }
        return resultsPerPage;
    }, {});
}
