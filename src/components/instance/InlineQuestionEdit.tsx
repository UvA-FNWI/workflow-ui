import {useState} from "react";

import {Button, Text} from "@uva-fnwi/datanose-ui";

import {InputControl} from "./InputControl.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {AnswerInput} from "~/store/api/types/params.ts";
import type {SaveAnswerResult} from "~/store/api/types/returnTypes.ts";
import type {Question} from "~/store/api/types/submissions.ts";

type Props = {
    instanceId: string;
    submissionId?: string;
    question: Question;
    value: unknown;
    visibleChoices?: string[] | null;
    onSave: (value: unknown) => Promise<{error?: unknown}>;
    /** External user creation saves before the Save button so the picker can receive the created user. */
    onSaveExternalUser?: (answer: AnswerInput) => Promise<SaveAnswerResult>;
    onClose: () => void;
};

export const InlineQuestionEdit = ({
    instanceId,
    submissionId,
    question,
    value,
    visibleChoices,
    onSave,
    onSaveExternalUser,
    onClose,
}: Props) => {
    const {t} = useTranslate("workflow");
    const [localValue, setLocalValue] = useState<unknown>(value ?? null);
    const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

    const handleSave = async () => {
        setStatus("saving");
        const result = await onSave(localValue);
        if (result.error) {
            setStatus("error");
            return;
        }
        onClose();
    };

    return (
        <div className="flex flex-col gap-2">
            <InputControl
                instanceId={instanceId}
                submissionId={submissionId ?? ""}
                value={localValue}
                question={question}
                onChange={setLocalValue}
                onSaveExternalUser={onSaveExternalUser}
                visibleChoices={visibleChoices}
            />
            {status === "error" && (
                <Text size="sm" intent="error">
                    {t("instance.summary.save_error")}
                </Text>
            )}
            <div className="flex gap-2">
                <Button
                    intent="primary"
                    variant="destructive"
                    onClick={handleSave}
                    isLoading={status === "saving"}
                >
                    {t("save")}
                </Button>
                <Button variant="destructive" intent="secondary" onClick={onClose}>
                    {t("cancel")}
                </Button>
            </div>
        </div>
    );
};
