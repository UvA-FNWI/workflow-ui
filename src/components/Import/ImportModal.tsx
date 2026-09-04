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

const ImportStep = {
    UploadFile: 1,
    SelectColumns: 2,
    Preview: 3,
} as const;

type ImportStep = (typeof ImportStep)[keyof typeof ImportStep];

export const ImportModal = ({isOpen, onClose}: ImportModalProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});
    const {t: tw} = useTranslate("workflow");
    const prevIsOpen = useRef(false);
    const errorHandled = useRef(false);
    const [activeStep, setActiveStep] = useState<ImportStep>(ImportStep.UploadFile);
    const [fileColumns, setFileColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ImportPreview>();
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const [confirm] = useConfirmMutation();
    const [preview] = usePreviewMutation();

    const {workflowDefinition, screenName} = useParams();

    const {
        data,
        error: importableColumnsError,
        isFetching: isFetchingImportableColumns,
    } = useGetColumnNamesQuery(
        {workflowDefinition: workflowDefinition ?? "", screenName: screenName ?? ""},
        {
            skip: !workflowDefinition || activeStep !== ImportStep.SelectColumns,
        },
    );

    const importableColumns = data?.columns ?? [];
    const importableColumnIdentifier = data?.identifier;

    const getPreviewModalSize = () => {
        if (activeStep !== ImportStep.Preview) return "sm";
        const columnCount = previewData?.columns.length ?? columnMapping.length;
        return columnCount <= 4 ? "xl" : "full";
    };

    const resetState = () => {
        setActiveStep(ImportStep.UploadFile);
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

    useEffect(() => {
        if (importableColumnsError && !errorHandled.current) {
            errorHandled.current = true;
            onClose();
            toast.error(t("error_importing"));
        }
        if (!importableColumnsError) {
            errorHandled.current = false;
        }
    }, [importableColumnsError, onClose, t, toast]);

    if (!workflowDefinition || !screenName) return;

    const isStepValid = (): boolean => {
        switch (activeStep) {
            case ImportStep.UploadFile:
                return !!file;
            case ImportStep.SelectColumns:
                return (
                    !isFetchingImportableColumns &&
                    columnMapping.length > 1 &&
                    !!importableColumnIdentifier &&
                    columnMapping.some(
                        (column) => column.propertyName == importableColumnIdentifier.name,
                    ) &&
                    !!file
                );
            case ImportStep.Preview:
                return (
                    !!previewData &&
                    !!file &&
                    columnMapping.length > 0 &&
                    previewData.rows.length > 0 &&
                    previewData.rows.every((row) => row.validationErrors.length === 0)
                );
            default:
                return false;
        }
    };

    const handleNextStep = async () => {
        if (!isStepValid()) return;

        if (activeStep === ImportStep.SelectColumns) {
            setIsLoading(true);
            const response = await preview({
                file: file!,
                workflowDefinition,
                screenName,
                columnMapping,
            });
            if (response.data) {
                setPreviewData(response.data);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                toast.error(t("error_importing"));
                onClose();
            }
        }

        if (activeStep === ImportStep.Preview) {
            if (!previewData) {
                toast.error(t("error_importing"));
                resetState();
                onClose();
                return;
            }
            await confirm({
                workflowDefinition,
                screenName,
                rows: previewData.rows.map((row) => ({
                    instanceId: row.instanceId,
                    values: row.values,
                })),
            });
            onClose();
            toast.success(t("success_importing"));
            return;
        }

        setActiveStep((prev) => (prev + 1) as ImportStep);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size={getPreviewModalSize()}>
            <Modal.Header
                subTitle={t("step_indicator", {
                    index: activeStep,
                    total: Object.values(ImportStep).length,
                })}
                description={
                    activeStep == ImportStep.Preview
                        ? t("description_verify")
                        : t("description_select")
                }
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
                                setActiveStep(ImportStep.SelectColumns);
                            }}
                            onFileRemove={() => {
                                setFile(null);
                                setFileColumns([]);
                            }}
                        />
                    )}
                    {activeStep === ImportStep.SelectColumns &&
                        (isFetchingImportableColumns || !importableColumnIdentifier ? (
                            <Text size="sm" intent="secondary">
                                {t("loading_data")}
                            </Text>
                        ) : (
                            <ImportColumnSelection
                                fileName={file?.name ?? ""}
                                fileColumns={fileColumns}
                                importableColumns={importableColumns}
                                importableColumnIdentifier={importableColumnIdentifier}
                                onRemoveFile={resetState}
                                onColumnMappingChange={setColumnMapping}
                            />
                        ))}
                    {activeStep === ImportStep.Preview && (
                        <div>
                            <div className="mb-8 flex gap-2">
                                <Text fontWeight="bold" size="sm">{`${t("shown_data")}:`}</Text>
                                <Text size="sm">
                                    {t("result_indicator", {
                                        amount: previewData?.rows.length,
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
