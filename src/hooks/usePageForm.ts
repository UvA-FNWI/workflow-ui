import {useEffect, useRef} from "react";

import {useForm} from "react-hook-form";

import {isEqual} from "lodash-es";

import type {Answer, Page} from "~/store/api/types/submissions";

type UsePageFormOptions = {
    answers: Answer[];
    page: Page;
};

// Sync server answers into the page form while preserving pending local edits.
export const usePageForm = ({answers, page}: UsePageFormOptions) => {
    const defaultValues = Object.fromEntries(
        answers
            .filter((answer) => answer.isVisible)
            .map((answer) => [answer.questionName, answer.value]),
    );
    const form = useForm({defaultValues});
    // Compare local values with the last server snapshot to detect unsaved edits.
    const previousAnswers = useRef(answers);

    useEffect(() => {
        for (const answer of answers) {
            if (!answer.isVisible) continue;

            const localValue = form.getValues(answer.questionName);
            if (isEqual(localValue, answer.value)) continue;

            const previousAnswer = previousAnswers.current.find(
                (previous) => previous.questionName === answer.questionName,
            );
            const isNewlyVisible = !previousAnswer?.isVisible;
            const hasLocalEdit = !isEqual(localValue, previousAnswer?.value);
            const isFileQuestion = page.elements.some(
                ({question}) => question?.name === answer.questionName && question.type === "File",
            );

            // Restore newly visible fields and completed file uploads. For other fields,
            // preserve local edits that may be newer than the save response or awaiting debounce.
            if (isFileQuestion || isNewlyVisible || !hasLocalEdit) {
                form.setValue(answer.questionName, answer.value);
            }
        }
        // Once the server acknowledges an edit, later server changes can sync again.
        previousAnswers.current = answers;
    }, [answers, form, page]);

    return form;
};
