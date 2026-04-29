import type {Answer, Page, Question, Submission} from "~/store/api/types/submissions.ts";

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

export function isPageComplete(page: Page, submission: Submission): boolean {
    return page.questions
        .filter((q) => q.isRequired)
        .every((question) => {
            const answer = submission.answers.find((a) => a.questionName === question.name);
            return (
                answer?.isVisible === false ||
                (answer?.value != null &&
                    answer.value !== "" &&
                    (!Array.isArray(answer.value) || answer.value.length > 0))
            );
        });
}
