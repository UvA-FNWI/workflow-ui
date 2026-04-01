import type {Result} from "~/store/api/types/assessments.ts";
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
