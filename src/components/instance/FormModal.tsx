import {Button, Modal} from "@uva-fnwi/datanose-ui";

import {FormSubmitButton} from "~/components/instance/FormSubmitButton.tsx";
import {PageControl} from "~/components/instance/PageControl.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";
import {isPageComplete} from "~/utils/submissionUtils.ts";

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

    if (!submission) return isOpen ? <div>Loading...</div> : null;

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Header className="pb-0">{l(submission?.form.title)}</Modal.Header>
            <Modal.Body className="mt-2">
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
                <FormSubmitButton
                    instanceId={instanceId}
                    submission={submission}
                    disabled={!isPageComplete(submission.form.pages[0], submission)}
                    onSubmit={onClose}
                    size="large"
                    text={t("confirm")}
                />
                <Button intent="secondary" variant="destructive" size="large" onClick={onClose}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
