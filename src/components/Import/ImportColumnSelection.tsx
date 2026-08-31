import {type Key, useState} from "react";

import {Button, Callout, Checkbox, Icon, Item, Select, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {ColumnMapping, ImportableProperty} from "~/store/api/types/import.ts";

type ImportColumnSelectionProps = {
    fileName: string;
    fileColumns: string[];
    importableColumns: ImportableProperty[];
    importableColumnIdentifier: ImportableProperty;
    onRemoveFile?: () => void;
    onColumnMappingChange?: (mapping: ColumnMapping[]) => void;
};

type ImportColumnSelectionRowProps = {
    name: string;
    columns: string[];
    selectedColumn: string;
    disabledKeys?: string[];
    onSelect: (value: Key | null) => void;
};

export const ImportColumnSelection = ({
    fileName,
    fileColumns,
    importableColumns,
    importableColumnIdentifier,
    onRemoveFile,
    onColumnMappingChange,
}: ImportColumnSelectionProps) => {
    const {t, l} = useTranslate("screens", {keyPrefix: "import"});
    const {t: tw} = useTranslate("workflow");
    const [selectedColumns, setSelectedColumns] = useState<Record<string, string>>({});

    const getColumnMapping = (columns: Record<string, string>): ColumnMapping[] =>
        Object.entries(columns)
            .filter(([, val]) => val !== "")
            .map(([propertyName, excelColumn]) => ({excelColumn, propertyName}));

    const getDisabledKeys = (currentColumnName: string) =>
        Object.entries(selectedColumns)
            .filter(([key, val]) => key !== currentColumnName && val !== "")
            .map(([, val]) => val);

    const handleColumnSelect = (propertyName: string) => (key: Key | null) => {
        const updated = {...selectedColumns, [propertyName]: key !== null ? String(key) : ""};
        setSelectedColumns(updated);
        onColumnMappingChange?.(getColumnMapping(updated));
    };

    return (
        <div>
            <div className="flex items-center bg-grey-200 px-4 py-2 dark:bg-grey-800 dark:text-white">
                <Text size="sm">{fileName}</Text>
                <Button
                    intent="ghost"
                    onClick={onRemoveFile}
                    aria-label="Remove file"
                    size="square"
                    className="ml-auto"
                >
                    <Icon name="trash-line" size="md" color="current" />
                </Button>
            </div>
            <div className="flex flex-col gap-2 py-4">
                <Text fontWeight="bold">
                    {t("select_identifier", {
                        identifier: l(importableColumnIdentifier.title) ?? t("identifier"),
                    })}
                </Text>
                <Select
                    value={selectedColumns[importableColumnIdentifier.name]}
                    onChange={handleColumnSelect(importableColumnIdentifier.name)}
                    placeholder={tw("select")}
                    disabledKeys={getDisabledKeys(importableColumnIdentifier.name)}
                >
                    {fileColumns.map((col) => (
                        <Item key={col}>{col}</Item>
                    ))}
                </Select>
            </div>

            <div className="flex flex-col gap-2 py-4">
                <Text fontWeight="bold">{t("column_selection")}</Text>
                {importableColumns.map((col) => (
                    <ImportColumnSelectionRow
                        name={l(col.title) ?? col.name}
                        key={col.name}
                        columns={fileColumns}
                        selectedColumn={selectedColumns[col.name]}
                        onSelect={handleColumnSelect(col.name)}
                        disabledKeys={getDisabledKeys(col.name)}
                    />
                ))}
            </div>
            <Callout>{t("staff_info_callout")}</Callout>
        </div>
    );
};

const ImportColumnSelectionRow = ({
    name,
    selectedColumn,
    onSelect,
    columns,
    disabledKeys = [],
}: ImportColumnSelectionRowProps) => {
    const {t: tw} = useTranslate("workflow");
    const [isSelected, setIsSelected] = useState(false);
    return (
        <div className="flex h-10 w-full gap-4" key={name}>
            <Checkbox
                label={name}
                isSelected={isSelected}
                onChange={() => {
                    if (isSelected) {
                        onSelect(null);
                    }
                    setIsSelected(!isSelected);
                }}
            />
            {isSelected && (
                <div className="ml-auto">
                    <Select
                        value={selectedColumn}
                        onChange={onSelect}
                        placeholder={tw("select")}
                        disabledKeys={disabledKeys}
                        className="h-10 w-40"
                    >
                        {columns.map((col) => (
                            <Item key={col}>{col}</Item>
                        ))}
                    </Select>
                </div>
            )}
        </div>
    );
};
