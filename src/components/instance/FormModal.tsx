import {Button, LoadingSpinner, Modal, Text} from "@uva-fnwi/datanose-ui";

import {FormPage} from "~/components/instance/FormPage.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";

type FormModalProps = {
    onClose: () => void;
    instanceId: string;
    submissionId: string;
    previousVersion?: number;
};

export const FormModal = ({onClose, instanceId, submissionId, previousVersion}: FormModalProps) => {
    const {t, l} = useTranslate("workflow");

    const {
        data: submission,
        isError,
        refetch,
    } = submissionsEndpoints.getSubmission.useQuery({
        instanceId,
        submissionId,
    });
    const title = submission ? l(submission.form.title) : t("form");

    return (
        <FormPage
            instanceId={instanceId}
            submissionId={submissionId}
            previousVersion={previousVersion}
            onClose={onClose}
            renderLayout={(content, actions) => (
                <Modal isOpen onOpenChange={onClose} size="lg" aria-label={title}>
                    <Modal.Header className="pb-0">{title}</Modal.Header>
                    <Modal.Body className="mt-2">
                        {isError ? (
                            <Text role="alert" intent="error">
                                {t("form_load_failed")}
                            </Text>
                        ) : submission ? (
                            content
                        ) : (
                            <LoadingSpinner />
                        )}
                    </Modal.Body>
                    <Modal.Footer className="flex-wrap gap-y-3">
                        <Button intent="secondary" onClick={onClose}>
                            {t("cancel")}
                        </Button>
                        <div className="ml-auto flex flex-wrap justify-end gap-3">
                            {isError ? (
                                <Button intent="primary" onClick={() => void refetch()}>
                                    {t("retry")}
                                </Button>
                            ) : (
                                actions
                            )}
                        </div>
                    </Modal.Footer>
                </Modal>
            )}
        />
    );
};
