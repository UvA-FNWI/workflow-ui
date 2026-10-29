import {Button, Modal, Text} from "@uva-fnwi/datanose-ui";

import {FormModal} from "~/components/instance/FormModal.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {actionsEndpoints} from "~/store/api/actionsApi.ts";
import type {Action} from "~/store/api/types/instances";
import {actionIntentToButtonProps} from "~/utils/actionIntentToButtonProps";

type Props = {
    instanceId: string;
    action: Action;
    onClose: () => void;
    previousVersion?: number;
};

export function ActionModal({instanceId, action, onClose, previousVersion}: Props) {
    const {t, l} = useTranslate("workflow");
    const [executeAction, {isLoading, isError}] = actionsEndpoints.executeAction.useMutation();

    if (action.type === "SubmitForm") {
        return (
            <FormModal
                onClose={onClose}
                instanceId={instanceId}
                submissionId={action.form ?? ""}
                previousVersion={previousVersion}
            />
        );
    }

    return (
        <Modal
            isOpen
            aria-label={l(action.title)}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <Modal.Header className="pb-0">{l(action.title)}</Modal.Header>
            <Modal.Body className="mt-2">
                <p>{t("are_you_sure")}</p>
                {isError && (
                    <Text role="alert" intent="error">
                        {t("action_failed")}
                    </Text>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    {...actionIntentToButtonProps(action.intent)}
                    isLoading={isLoading}
                    onClick={async () => {
                        const result = await executeAction({
                            instanceId,
                            name: action.name,
                            type: action.type,
                        });
                        if (!result.error) onClose();
                    }}
                >
                    {t("confirm")}
                </Button>
                <Button intent="secondary" onClick={onClose}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
