import {type Key, useState} from "react";

import {Button, Callout, Checkbox, Icon, Item, Select, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";

type ImportColumnSelectionProps = {
    columns: string[];
    fileName: string;
    onRemoveFile?: () => void;
};

type ImportColumnSelectionRowProps = {
    name: string;
    columns: string[];
    selectedColumn: string;
    disabledKeys?: string[];
    onSelect: (value: Key | null) => void;
};

export const ImportColumnSelection = ({
    columns,
    fileName,
    onRemoveFile,
}: ImportColumnSelectionProps) => {
    const {t} = useTranslate("screens", {keyPrefix: "import"});
    const {t: tw} = useTranslate("workflow");
    const [selectedColumns, setSelectedColumns] = useState<Record<string, string>>(() =>
        Object.fromEntries(columns.map((col) => [col, ""])),
    );

    const handleColumnSelect = (col: string) => (key: Key | null) => {
        setSelectedColumns((prev) => ({...prev, [col]: key !== null ? String(key) : ""}));
    };

    return (
        <div>
            <div className="flex items-center bg-grey-200 px-4 py-2 dark:bg-grey-800 dark:text-white">
                <Text size="sm" decoration="underline">
                    {fileName}
                </Text>
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
                <Text fontWeight="bold">{t("select_student_number")}</Text>
                <Select
                    value={selectedColumns["Studentnummer"]}
                    onChange={handleColumnSelect("Studentnummer")}
                    placeholder={tw("select")}
                >
                    {columns.map((col) => (
                        <Item key={col}>{col}</Item>
                    ))}
                </Select>
            </div>

            <div className="flex flex-col gap-2 py-4">
                <Text fontWeight="bold">{t("column_selection")}</Text>
                {columns.map((col) => (
                    <ImportColumnSelectionRow
                        name={col}
                        key={col}
                        columns={columns}
                        selectedColumn={selectedColumns[col]}
                        onSelect={handleColumnSelect(col)}
                        disabledKeys={Object.entries(selectedColumns)
                            .filter(([key, val]) => key !== col && val !== "")
                            .map(([, val]) => val)}
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
                onChange={() => setIsSelected(!isSelected)}
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
