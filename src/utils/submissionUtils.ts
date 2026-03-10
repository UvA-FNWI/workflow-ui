import type {Answer, Question} from "~/store/api/types/submissions.ts";

export type QuestionAnswerPair = {
    question: Question;
    answer: Answer | null;
};

export function getVisibleQuestionAnswerPairs(
    questions: Question[],
    answers: Answer[],
): QuestionAnswerPair[] {
    return questions
        .filter((question) => !question.hideInResults)
        .map((question) => ({
            question,
            answer: answers.find((a) => a.questionName === question.name) ?? null,
        }))
        .filter((pair) => pair.answer?.isVisible !== false);
}
