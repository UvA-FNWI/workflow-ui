import {useCallback, useEffect} from "react";

import {useDebounce} from "~/hooks/useDebounce";
import type {AnswerInput} from "~/store/api/types/params";
import type {SaveAnswerResult} from "~/store/api/types/returnTypes";
import {registerAnswerFlusher} from "~/utils/flushPendingAnswers";

type UseAnswerAutosaveOptions = {
    instanceId: string;
    submissionId: string;
    questionName: string;
    onChange?: (value: unknown) => void;
    onSave?: (answer: AnswerInput) => Promise<SaveAnswerResult>;
};

export function useAnswerAutosave({
    instanceId,
    submissionId,
    questionName,
    onChange,
    onSave,
}: UseAnswerAutosaveOptions) {
    const save = useCallback(
        (value: unknown) => {
            if (!onSave) return;
            void onSave({questionName, value}).catch((error) => {
                console.error("Failed to save answer:", error);
            });
        },
        [questionName, onSave],
    );
    const debouncedSave = useDebounce(save, 500, true);

    // Submit must also be able to flush edits while their inputs are still mounted.
    useEffect(() => {
        if (!onSave) return;
        return registerAnswerFlusher(instanceId, submissionId, debouncedSave.flush);
    }, [instanceId, submissionId, onSave, debouncedSave]);

    // Update the local draft immediately, regardless of how its save is scheduled.
    const debouncedChange = (value: unknown) => {
        onChange?.(value);
        debouncedSave(value);
    };
    const immediateChange = (value: unknown) => {
        onChange?.(value);
        save(value);
    };

    return {debouncedChange, immediateChange};
}
