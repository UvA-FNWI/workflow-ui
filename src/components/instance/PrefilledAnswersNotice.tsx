import {useState} from "react";

import {Button, Callout, Modal, useToast} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {answersApi} from "~/store/api/answersApi.ts";

type Props = {
    instanceId: string;
    submissionId: string;
    previousVersion?: number;
};

type NoticeProps = Omit<Props, "previousVersion"> & {previousVersion: number};

const getClearedVersion = (key: string) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const saveClearedVersion = (key: string, version: string) => {
    try {
        localStorage.setItem(key, version);
    } catch {
        return;
    }
};

const Notice = ({instanceId, submissionId, previousVersion}: NoticeProps) => {
    const {t} = useTranslate("workflow");
    const toast = useToast();
    const [clearAnswers] = answersApi.endpoints.clearAnswers.useMutation();
    const storageKey = `prefilled-answers-cleared:${instanceId}:${submissionId}`;
    const version = previousVersion.toString();
    const [isVisible, setIsVisible] = useState(() => getClearedVersion(storageKey) !== version);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const clear = async () => {
        setIsClearing(true);
        try {
            await clearAnswers({instanceId, submissionId}).unwrap();
            saveClearedVersion(storageKey, version);
            setIsVisible(false);
            setIsConfirming(false);
        } catch {
            toast.error(t("repeated_form.clear_error"));
        } finally {
            setIsClearing(false);
        }
    };

    if (!isVisible) return null;

    return (
        <>
            <Callout type="info" className="mb-4">
                <div className="flex flex-col items-start gap-3">
                    <p>{t("repeated_form.message")}</p>
                    <p>{t("repeated_form.question")}</p>
                    <Button
                        intent="secondary"
                        variant="destructive"
                        onClick={() => setIsConfirming(true)}
                    >
                        {t("repeated_form.clear")}
                    </Button>
                </div>
            </Callout>
            <Modal
                role="alertdialog"
                isOpen={isConfirming}
                onOpenChange={setIsConfirming}
                showCloseButton={false}
                isDismissable={!isClearing}
                isKeyboardDismissDisabled={isClearing}
            >
                <Modal.Header>{t("repeated_form.confirm_title")}</Modal.Header>
                <Modal.Body>{t("repeated_form.confirm_message")}</Modal.Body>
                <Modal.Footer>
                    <Button
                        intent="primary"
                        variant="destructive"
                        isLoading={isClearing}
                        onClick={() => void clear()}
                    >
                        {t("repeated_form.clear")}
                    </Button>
                    <Button
                        intent="secondary"
                        variant="destructive"
                        disabled={isClearing}
                        onClick={() => setIsConfirming(false)}
                    >
                        {t("cancel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export const PrefilledAnswersNotice = ({previousVersion, ...props}: Props) =>
    previousVersion === undefined ? null : <Notice {...props} previousVersion={previousVersion} />;
