import {useState} from "react";

import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {Button, Modal} from "@uva-fnwi/datanose-ui";

import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
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

    const [submitSubmission, {isLoading}] = submissionsEndpoints.submitSubmission.useMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async () => {
        const res = await submitSubmission({
            instanceId,
            submissionId: submission.id,
        });
        const errorResult = (res.error as FetchBaseQueryError)?.data as SubmitSubmissionResult;
        if (errorResult?.validationErrors?.length) {
            // TODO: validation (DN-3424)
            const question = errorResult.validationErrors[0];
            alert(`Not valid! ${question.questionName}: ${l(question.validationMessage)}`);
            return;
        }
        onSubmit();
    };

    const handleClick = () => {
        if (submission.form.confirmation) {
            setIsModalOpen(true);
        } else {
            void handleSubmit();
        }
    };

    return (
        <>
            <Button
                intent="primary"
                variant="destructive"
                size={size}
                disabled={disabled}
                isLoading={isLoading}
                onClick={handleClick}
            >
                {text ?? t("submit")}
            </Button>

            {submission.form.confirmation && (
                <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                    <Modal.Header>{l(submission.form.confirmation.title)}</Modal.Header>
                    <Modal.Body>
                        <div className="flex flex-col gap-2">
                            <MarkdownRenderer>
                                {l(submission.form.confirmation.text)}
                            </MarkdownRenderer>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            intent="primary"
                            variant="destructive"
                            size="large"
                            isLoading={isLoading}
                            onClick={handleSubmit}
                        >
                            {t("confirm")}
                        </Button>
                        <Button
                            intent="secondary"
                            variant="destructive"
                            size="large"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {t("cancel")}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};
