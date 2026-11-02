import type {LocalString} from "~/hooks/useTranslate.ts";
import type {
    Answer,
    Page,
    Question,
    Submission,
    WeightedQuestion,
} from "~/store/api/types/submissions.ts";

export function isWeightedQuestion(question: Question): question is WeightedQuestion {
    return "weight" in question;
}

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
            percentage: isWeightedQuestion(question) ? question.percentage : null,
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
    return page.elements
        .filter((element) => element.kind === "Question")
        .map((element) => element.question!)
        .filter(
            (q) =>
                q.isRequired &&
                (!weightedOnly || (isWeightedQuestion(q) && q.weight != null && q.weight > 0)),
        )
        .every((question) => {
            const answer = submission.answers.find((a) => a.questionName === question.name);

            if (answer?.isVisible === false) return true;

            const hasError = !!answer?.validationError;

            const hasValue =
                question.type === "Check"
                    ? answer?.value === true
                    : answer?.value != null &&
                      answer.value !== "" &&
                      (!Array.isArray(answer.value) || answer.value.length > 0);
            return hasValue && !hasError;
        });
}
