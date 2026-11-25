import {skipToken} from "@reduxjs/toolkit/query";
import {Button, LoadingSpinner, Modal, Text} from "@uva-fnwi/datanose-ui";

import {FormPage, type FormPageSource} from "~/components/instance/FormPage.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {submissionsEndpoints} from "~/store/api/submissionsApi.ts";

export const FormModal = ({onClose, ...source}: FormPageSource & {onClose: () => void}) => {
    const {t, l} = useTranslate(["workflow", "common"]);

    const {
        data: submission,
        isError,
        refetch,
    } = submissionsEndpoints.getSubmission.useQuery(
        source.previewForm
            ? skipToken
            : {instanceId: source.instanceId, submissionId: source.submissionId},
    );
    const form = source.previewForm ?? submission?.form;
    const title = form ? l(form.title) : t("form");

    return (
        <FormPage
            {...source}
            onClose={onClose}
            renderLayout={(content, actions) => (
                <Modal isOpen onOpenChange={onClose} size="lg" aria-label={title}>
                    <Modal.Header className="pb-0">{title}</Modal.Header>
                    <Modal.Body className="mt-2">
                        {isError ? (
                            <Text role="alert" intent="error">
                                {t("form_load_failed")}
                            </Text>
                        ) : form ? (
                            content
                        ) : (
                            <LoadingSpinner />
                        )}
                    </Modal.Body>
                    <Modal.Footer className="flex-wrap gap-y-3">
                        <Button intent="secondary" onClick={onClose}>
                            {source.previewForm ? t("common:close") : t("common:cancel")}
                        </Button>
                        <div className="flex flex-wrap justify-end gap-3">
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
