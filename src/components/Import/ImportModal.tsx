import {useState} from "react";

import {useParams} from "react-router";

import {Button, Modal, Text} from "@uva-fnwi/datanose-ui";

import {ImportColumnSelection} from "~/components/Import/ImportColumnSelection.tsx";
import {ImportFileUpload} from "~/components/Import/ImportFileUpload.tsx";
import {ImportOverview} from "~/components/Import/ImportOverview.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {useConfirmMutation, usePreviewMutation} from "~/store/api/importApi.ts";
import type {ColumnMapping, ImportPreview} from "~/store/api/types/import.ts";

type ImportModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const ImportModal = ({isOpen, onClose}: ImportModalProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});
    const {t: tw} = useTranslate("workflow");
    const [activeStep, setActiveStep] = useState(1);
    const [fileColumns, setFileColumns] = useState<string[]>([]);
    const [confirm] = useConfirmMutation();
    const [preview] = usePreviewMutation();
    const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ImportPreview>();

    const {workflowDefinition} = useParams();

    if (!workflowDefinition) return;

    const totalSteps = 3;

    const nextStep = async () => {
        let response;

        switch (activeStep) {
            case 1:
                if (!file) {
                    return;
                }
                setActiveStep(activeStep + 1);
                return;
            case 2:
                if (columnMapping.length === 0 || !file) {
                    return;
                }
                response = await preview({
                    file,
                    workflowDefinition,
                    columnMapping,
                });
                console.log("response", response);
                if (response.data) {
                    setPreviewData(response.data);
                }
                setActiveStep(activeStep + 1);
                return;
            case 3:
                if (!previewData || !file || columnMapping.length === 0) {
                    return;
                }
                await confirm({
                    file,
                    workflowDefinition,
                    columnMapping,
                });
                onClose();
                return;
        }
    };

    const handleRemoveFile = () => {
        console.log("Remove file");
        setFile(null);
        setActiveStep(1);
    };

    const handleCancel = () => {
        onClose();
        setActiveStep(1);
        setFile(null);
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
                                setFile(fileName);
                                setFileColumns(cols);
                                setActiveStep(2);
                            }}
                            onFileRemove={() => {
                                setFile(null);
                                setFileColumns([]);
                            }}
                        />
                    )}
                    {activeStep === 2 && (
                        <ImportColumnSelection
                            fileName={file?.name ?? ""}
                            fileColumns={fileColumns}
                            screenColumns={screenColumns}
                            onRemoveFile={handleRemoveFile}
                            onColumnMappingChange={setColumnMapping}
                        />
                    )}
                    {activeStep === 3 && <ImportOverview data={previewData} />}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    disabled={!file || columnMapping.length === 0}
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
