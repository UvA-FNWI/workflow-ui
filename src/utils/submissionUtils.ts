import type {LocalString} from "~/hooks/useTranslate.ts";
import type {Answer, Page, Question, Submission} from "~/store/api/types/submissions.ts";

export type QuestionAnswerPair = {
    question: Question;
    answer: Answer | null;
    percentage: number | null;
    submission?: Submission;
    columnTitle?: LocalString;
};

export function getVisibleQuestionAnswerPairs(
    questions: Question[],
    answers: Answer[],
    submission?: Submission,
    columnTitle?: LocalString,
): QuestionAnswerPair[] {
    return questions
        .filter((question) => !question.hideInResults)
        .map((question) => ({
            question,
            answer: answers.find((a) => a.questionName === question.name) ?? null,
            percentage: question.percentage,
            submission,
            columnTitle,
        }))
        .filter((pair) => pair.answer?.isVisible !== false);
}

export function isPageComplete(
    page: Page,
    submission: Submission,
    weightedOnly?: boolean,
): boolean {
    return page.questions
        .filter((q) => (weightedOnly ? q.weight != null && q.weight > 0 : q.isRequired))
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
