import type {QuestionResult} from "~/store/api/types/assessments.ts";
import type {Answer, Page, Question, Submission} from "~/store/api/types/submissions.ts";

export type QuestionAnswerPair = {
    question: Question;
    answer: Answer | null;
    percentage: number | null;
};

export function getVisibleQuestionAnswerPairs(
    questions: Question[],
    answers: Answer[],
    percentages?: QuestionResult[],
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

export function isPageComplete(
    page: Page,
    submission: Submission,
    weightedOnly?: boolean,
): boolean {
    return page.questions
        .filter((q) => q.isRequired && (!weightedOnly || (q.weight && q.weight > 0)))
        .every((question) => {
            const answer = submission.answers.find((a) => a.questionName === question.name);

            if (answer?.isVisible === false) return true;

            const hasError = !!answer?.validationError;

            const hasValue =
                answer?.value != null &&
                answer.value !== "" &&
                (!Array.isArray(answer.value) || answer.value.length > 0);
            return hasValue && !hasError;
        });
}
