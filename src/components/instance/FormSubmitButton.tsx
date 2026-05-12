import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {Button} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";
import type {SubmitSubmissionResult} from "~/store/api/types/returnTypes.ts";
import type {Submission} from "~/store/api/types/submissions.ts";

type Props = {
    instanceId: string;
    submission: Submission;
    onSubmit: () => void;
    disabled?: boolean;
    size?: "small" | "medium" | "large";
};

export const FormSubmitButton = ({
    instanceId,
    submission,
    onSubmit,
    disabled,
    size = "medium",
}: Props) => {
    const {t, l} = useTranslate("workflow");

    const [submitSubmission, {isLoading}] = submissionsEndpoints.submitSubmission.useMutation();

    return (
        <Button
            intent="primary"
            variant="destructive"
            className="ml-auto"
            size={size}
            disabled={disabled}
            isLoading={isLoading}
            onClick={async () => {
                const res = await submitSubmission({
                    instanceId,
                    submissionId: submission.id,
                });
                const errorResult = (res.error as FetchBaseQueryError)
                    ?.data as SubmitSubmissionResult;
                if (errorResult?.validationErrors.length) {
                    // TODO: validation (DN-3424)
                    const question = errorResult.validationErrors[0];
                    alert(`Not valid! ${question.questionName}: ${l(question.validationMessage)}`);
                    return;
                }
                onSubmit();
            }}
        >
            {t("submit")}
        </Button>
    );
};
