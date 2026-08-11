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
