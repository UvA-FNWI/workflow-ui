import type {LocalString} from "~/hooks/useTranslate.ts";

export type ImportFileRequest = {
    file: File;
    workflowDefinition: string;
    columnMapping: ColumnMapping[];
};

export type ColumnMapping = {
    excelColumn: string;
    propertyName: string;
};

export type ImportPreviewRow = {
    instanceId: string;
    values: Record<string, string | null>;
    errors: string[];
};

export type ImportPreview = {
    rows: ImportPreviewRow[];
    globalErrors: string[];
};

export type ImportableProperty = {
    name: string;
    title: LocalString;
    dataType: string;
};
