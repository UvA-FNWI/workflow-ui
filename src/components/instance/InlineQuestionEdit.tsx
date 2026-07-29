import {useState} from "react";

import {Button, Text} from "@uva-fnwi/datanose-ui";

import {InputControl} from "./InputControl.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {answersApi} from "~/store/api/answersApi.ts";
import type {Answer, Question} from "~/store/api/types/submissions.ts";

type Props = {
    question: Question;
    answer: Answer | null;
    instanceId: string;
    submissionId: string;
    onClose: () => void;
};

export const InlineQuestionEdit = ({
    question,
    answer,
    instanceId,
    submissionId,
    onClose,
}: Props) => {
    const {t} = useTranslate("workflow");
    const [localValue, setLocalValue] = useState<unknown>(answer?.value ?? null);
    const [saveAnswer, {isLoading, isError}] = answersApi.endpoints.saveAnswer.useMutation();

    const handleSave = async () => {
        const result = await saveAnswer({
            instanceId,
            submissionId,
            answer: {questionName: question.name, value: localValue},
        });
        if (!("error" in result)) {
            onClose();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <InputControl
                value={localValue}
                question={question}
                onChange={setLocalValue}
                onSaveExternalUser={(answerInput) =>
                    saveAnswer({instanceId, submissionId, answer: answerInput}).unwrap()
                }
                visibleChoices={answer?.visibleChoices}
            />
            {isError && (
                <Text size="sm" intent="error">
                    {t("instance.summary.save_error")}
                </Text>
            )}
            <div className="flex gap-2">
                <Button
                    intent="primary"
                    variant="destructive"
                    onClick={handleSave}
                    isLoading={isLoading}
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
