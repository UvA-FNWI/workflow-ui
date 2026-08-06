import {useState} from "react";

import {Button, Modal, Text} from "@uva-fnwi/datanose-ui";

import {ImportColumnSelection} from "~/components/Import/ImportColumnSelection.tsx";
import {ImportFileUpload} from "~/components/Import/ImportFileUpload.tsx";
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
    const [fileColumns, setFileColumns] = useState<string[]>([]);

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

    const screenColumns = ["Column 1", "Column 2", "Column 3"];

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <Modal.Header subTitle={t("step_indicator", {index: activeStep, total: totalSteps})}>
                {t("title")}
            </Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-4 pr-8">
                    <Text>{t("description")}</Text>
                    {activeStep === 1 && (
                        <ImportFileUpload
                            onFileSelect={(fileName, cols) => {
                                setSelectedFile(fileName);
                                setFileColumns(cols);
                                setActiveStep(2);
                            }}
                            onFileRemove={() => {
                                setSelectedFile(null);
                                setFileColumns([]);
                            }}
                        />
                    )}
                    {activeStep === 2 && (
                        <ImportColumnSelection
                            fileName={selectedFile ?? ""}
                            fileColumns={fileColumns}
                            screenColumns={screenColumns}
                            onRemoveFile={handleRemoveFile}
                        />
                    )}
                    {activeStep === 3 && <ImportOverview data={fileColumns} />}
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
