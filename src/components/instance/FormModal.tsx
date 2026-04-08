import {Button, Modal} from "@datanose/ui";
import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";

import {PageControl} from "~/components/instance/PageControl.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";
import type {SubmitSubmissionResult} from "~/store/api/types/returnTypes.ts";

type FormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    instanceId: string;
    submissionId: string;
};

export const FormModal = ({isOpen, onClose, instanceId, submissionId}: FormModalProps) => {
    const {t, l} = useTranslate("workflow");

    const {data: submission} = submissionsEndpoints.getSubmission.useQuery(
        {
            instanceId,
            submissionId,
        },
        {skip: !isOpen},
    );
    const [submitSubmission, {isLoading}] = submissionsEndpoints.submitSubmission.useMutation();

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Header className="pb-0 text-2xl font-semibold">
                {l(submission?.form.title)}
            </Modal.Header>
            <Modal.Body className="mt-2 text-lg">
                {submission && (
                    <PageControl
                        showTitle={false}
                        instanceId={instanceId}
                        submissionId={submissionId}
                        page={submission.form.pages[0]}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    size="large"
                    isLoading={isLoading}
                    onClick={async () => {
                        const res = await submitSubmission({instanceId, submissionId});
                        const errorResult = (res.error as FetchBaseQueryError)
                            ?.data as SubmitSubmissionResult;
                        if (errorResult?.validationErrors.length) {
                            // TODO: validation (DN-3424)
                            const question = errorResult.validationErrors[0];
                            alert(
                                `Not valid! ${question.questionName}: ${l(question.validationMessage)}`,
                            );
                            return;
                        }
                        onClose();
                    }}
                >
                    {t("confirm")}
                </Button>
                <Button
                    intent="secondary"
                    variant="destructive"
                    size="large"
                    disabled={isLoading}
                    onClick={onClose}
                >
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
