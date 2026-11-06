import {useEffect, useRef} from "react";

import {useForm} from "react-hook-form";

import {isEqual} from "lodash-es";

import type {Answer} from "~/store/api/types/submissions";

// Sync server answers into the page form while preserving pending local edits.
export const usePageForm = (answers: Answer[]) => {
    const form = useForm({
        defaultValues: Object.fromEntries(
            answers
                .filter((answer) => answer.isVisible)
                .map((answer) => [answer.questionName, answer.value]),
        ),
    });
    const editedFields = useRef(new Set<string>());
    const {subscribe} = form;

    // Track user edits, including backspacing to a previously saved value.
    // Programmatic updates (such as file uploads) do not mark fields as edited.
    useEffect(
        () =>
            subscribe({
                formState: {values: true},
                callback: ({name, type}) => {
                    if (name && type === "change") {
                        editedFields.current.add(name);
                    }
                },
            }),
        [subscribe],
    );

    // Apply server answers without overwriting edits that are still awaiting a save response.
    useEffect(() => {
        for (const {questionName, value, isVisible} of answers) {
            const localValue = form.getValues(questionName);
            // The date picker returns a Date; the server returns an ISO date string.
            const serverValue =
                localValue instanceof Date && typeof value === "string" ? new Date(value) : value;
            const matchesServer = isEqual(localValue, serverValue);

            if (!isVisible || matchesServer) {
                // Matching answers acknowledge edits; hidden fields sync when shown again.
                editedFields.current.delete(questionName);
            } else if (!editedFields.current.has(questionName)) {
                form.setValue(questionName, value);
            }
        }
    }, [answers, form]);

    return form;
};
