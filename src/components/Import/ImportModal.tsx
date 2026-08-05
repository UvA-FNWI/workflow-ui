import {useState} from "react";

import {Button, Icon, Modal, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";

type ImportModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const ImportModal = ({isOpen, onClose}: ImportModalProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});
    const {t: tw} = useTranslate("workflow");
    const [hasUploaded, setHasUploaded] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    const totalSteps = 3;
    const nextStep = () => {
        if (activeStep === totalSteps) {
            onClose();
        } else {
            setActiveStep(activeStep + 1);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Header subTitle={t("step_indicator", {index: activeStep, total: totalSteps})}>
                {t("title")}
            </Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-4">
                    <Text>{t("description")}</Text>
                    <Button
                        intent="secondary"
                        leftIcon={<Icon name="download-solid" size="sm" color="current" />}
                        className="w-fit"
                        size="large"
                        onClick={() => setHasUploaded(true)}
                    >
                        {t("upload_file")}
                    </Button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    disabled={!hasUploaded}
                    onClick={nextStep}
                    size="large"
                >
                    {tw("confirm")}
                </Button>
                <Button intent="secondary" variant="destructive" size="large" onClick={onClose}>
                    {tw("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
