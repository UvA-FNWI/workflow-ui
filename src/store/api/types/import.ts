import type {LocalString} from "~/hooks/useTranslate.ts";

export type ImportFileRequest = {
    file: File;
    workflowDefinition: string;
    screenName: string;
    columnMapping: ColumnMapping[];
};

export type ColumnMapping = {
    excelColumn: string;
    propertyName: string;
};

export type ImportColumnNamesResponse = {
    columns: ImportableProperty[];
    identifier: ImportableProperty;
};

export type ImportPreviewRow = {
    instanceId: string;
    values: Record<string, string>;
    validationErrors: ImportPreviewError[];
};

export type ImportPreview = {
    columns: ImportableProperty[];
    rows: ImportPreviewRow[];
};

export type ImportableProperty = {
    name: string;
    title: LocalString;
    dataType: string;
};

export type ImportPreviewError = {
    column: string;
    code: string;
    message: LocalString;
};

export type ImportConfirmRequest = {
    workflowDefinition: string;
    screenName: string;
    rows: ImportConfirmRow[];
};

export type ImportConfirmRow = {
    instanceId: string;
    values: Record<string, string>;
};
