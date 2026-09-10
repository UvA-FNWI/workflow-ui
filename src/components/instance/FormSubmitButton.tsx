import {useRef, useState} from "react";

import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {Button} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";
import type {SubmitSubmissionResult} from "~/store/api/types/returnTypes.ts";
import type {Submission} from "~/store/api/types/submissions.ts";
import {flushPendingAnswers} from "~/utils/flushPendingAnswers.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onSubmit: () => void;
    disabled?: boolean;
    size?: "small" | "medium" | "large";
    text?: string;
};

export const FormSubmitButton = ({
    instanceId,
    submission,
    onSubmit,
    disabled,
    size = "medium",
    text,
}: Props) => {
    const {t, l} = useTranslate("workflow");
    const submitting = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [submitSubmission, {isLoading}] = submissionsEndpoints.submitSubmission.useMutation();

    return (
        <Button
            intent="primary"
            variant="destructive"
            size={size}
            disabled={disabled}
            isLoading={isSubmitting || isLoading}
            onClick={async () => {
                if (submitting.current) return;
                submitting.current = true;
                setIsSubmitting(true);
                try {
                    try {
                        await flushPendingAnswers(instanceId, submission.id);
                    } catch (error) {
                        console.error("Failed to save answers before submitting:", error);
                        alert(t("instance.summary.save_error"));
                        return;
                    }
                    const res = await submitSubmission({
                        instanceId,
                        submissionId: submission.id,
                    });
                    if (res.error) {
                        console.error("Failed to submit form:", res.error);
                        const errorResult = (res.error as FetchBaseQueryError)
                            ?.data as SubmitSubmissionResult;
                        const question = errorResult?.validationErrors?.[0];
                        alert(
                            question
                                ? `Not valid! ${question.questionName}: ${l(question.validationMessage)}`
                                : t("instance.summary.submit_error"),
                        );
                        return;
                    }
                    onSubmit();
                } catch (error) {
                    console.error("Failed to submit form:", error);
                    alert(t("instance.summary.submit_error"));
                } finally {
                    submitting.current = false;
                    setIsSubmitting(false);
                }
            }}
        >
            {text ?? t("submit")}
        </Button>
    );
};
