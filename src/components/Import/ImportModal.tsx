import {useEffect, useRef, useState} from "react";

import {useParams} from "react-router";

import {Button, Modal, Text, useToast} from "@uva-fnwi/datanose-ui";

import {ImportColumnSelection} from "~/components/Import/ImportColumnSelection.tsx";
import {ImportFileUpload} from "~/components/Import/ImportFileUpload.tsx";
import {ImportOverview} from "~/components/Import/ImportOverview.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {
    useConfirmMutation,
    useGetColumnNamesQuery,
    usePreviewMutation,
} from "~/store/api/importApi.ts";
import type {ColumnMapping, ImportPreview} from "~/store/api/types/import.ts";

type ImportModalProps = {
    isOpen: boolean;
    onClose: () => void;
};
export const StudentNumberKey = "UserName";
export const ImportModal = ({isOpen, onClose}: ImportModalProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});
    const {t: tw} = useTranslate("workflow");
    const prevIsOpen = useRef(false);
    const [activeStep, setActiveStep] = useState(1);
    const [fileColumns, setFileColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ImportPreview>();
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const [confirm] = useConfirmMutation();
    const [preview] = usePreviewMutation();

    const {workflowDefinition} = useParams();
    const {data: importableColumns = []} = useGetColumnNamesQuery(workflowDefinition ?? "", {
        skip: !workflowDefinition || activeStep !== 2,
    });
    const resetState = () => {
        setActiveStep(1);
        setFileColumns([]);
        setColumnMapping([]);
        setFile(null);
        setPreviewData(undefined);
    };

    useEffect(() => {
        if (!prevIsOpen.current && isOpen) {
            resetState();
        }
        prevIsOpen.current = isOpen;
    }, [isOpen]);

    if (!workflowDefinition) return;

    const totalSteps = 3;

    const isStepValid = (): boolean => {
        switch (activeStep) {
            case 1:
                return !!file;
            case 2:
                return (
                    columnMapping.length > 1 &&
                    columnMapping.find((column) => column.propertyName == StudentNumberKey) !=
                        undefined &&
                    !!file
                );
            case 3:
                return !!previewData && !!file && columnMapping.length > 0;
            default:
                return false;
        }
    };

    const handleNextStep = async () => {
        if (!isStepValid()) return;

        if (activeStep === 2) {
            setIsLoading(true);
            const response = await preview({file: file!, workflowDefinition, columnMapping});
            if (response.data) {
                setPreviewData(response.data);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                toast.error(t("error_importing"));
                onClose();
            }
        }

        if (activeStep === totalSteps) {
            await confirm({file: file!, workflowDefinition, columnMapping});
            onClose();
            return;
        }

        setActiveStep((prev) => prev + 1);
    };

    const handleRemoveFile = () => {
        console.log("Remove file");
        setFile(null);
        setActiveStep(1);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size={activeStep === 3 ? "full" : "sm"}>
            <Modal.Header
                subTitle={t("step_indicator", {index: activeStep, total: totalSteps})}
                description={activeStep == 3 ? t("description_verify") : t("description_select")}
            >
                {t("title")}
            </Modal.Header>
            <Modal.Body className="max-h-[60vh] overflow-y-auto">
                <div>
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
                            importableColumns={importableColumns}
                            onRemoveFile={handleRemoveFile}
                            onColumnMappingChange={setColumnMapping}
                        />
                    )}
                    {activeStep === 3 && (
                        <div>
                            <div className="mb-8 flex gap-2">
                                <Text fontWeight="bold" size="sm">{`${t("shown_data")}:`}</Text>
                                <Text size="sm">
                                    {t("result_indicator", {
                                        count: "xx",
                                        total: previewData?.rows.length,
                                    })}
                                </Text>
                            </div>
                            <ImportOverview data={previewData} />
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    disabled={!isStepValid()}
                    onClick={handleNextStep}
                    size="large"
                    isLoading={isLoading}
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
