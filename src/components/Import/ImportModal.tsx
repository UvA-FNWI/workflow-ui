import {useState} from "react";

import {Button, Icon, Modal, Text} from "@uva-fnwi/datanose-ui";

import {ImportColumnSelection} from "~/components/Import/ImportColumnSelection.tsx";
import {ImportOverview} from "~/components/Import/ImportOverview.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";

type ImportModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const ImportModal = ({isOpen, onClose}: ImportModalProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});
    const {t: tw} = useTranslate("workflow");
    const [activeStep, setActiveStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const totalSteps = 3;
    const nextStep = () => {
        if (activeStep === totalSteps) {
            onClose();
        } else {
            setActiveStep(activeStep + 1);
        }
    };

    const handleRemoveFile = () => {
        console.log("Remove file");
        setSelectedFile(null);
        setActiveStep(1);
    };

    const handleCancel = () => {
        onClose();
        setActiveStep(1);
        setSelectedFile(null);
    };

    const columns = [
        "Studentnummer",
        "Vakcode",
        "Verkort onderwerp",
        "1e beoordelaar",
        "2e beoordelaar",
        "extra rol o.b.v. config",
        "Examinator",
    ];

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Header subTitle={t("step_indicator", {index: activeStep, total: totalSteps})}>
                {t("title")}
            </Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-4 pr-8">
                    <Text>{t("description")}</Text>
                    {activeStep === 1 && (
                        <Button
                            intent="secondary"
                            leftIcon={<Icon name="download-solid" size="sm" color="current" />}
                            className="w-fit"
                            size="large"
                            onClick={() => {
                                setSelectedFile("Bestandsnaam.pdf");
                            }}
                        >
                            {t("upload_file")}
                        </Button>
                    )}
                    {activeStep === 2 && (
                        <ImportColumnSelection
                            columns={columns}
                            fileName={selectedFile ?? ""}
                            onRemoveFile={handleRemoveFile}
                        />
                    )}
                    {activeStep === 3 && <ImportOverview data={columns} />}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    disabled={!selectedFile}
                    onClick={nextStep}
                    size="large"
                >
                    {tw("confirm")}
                </Button>
                <Button
                    intent="secondary"
                    variant="destructive"
                    size="large"
                    onClick={handleCancel}
                >
                    {tw("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
