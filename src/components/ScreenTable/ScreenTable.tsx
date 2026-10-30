import {useMemo} from "react";

import {type ColumnDef, type OnChangeFn, type RowSelectionState} from "@tanstack/react-table";
import {Button, Checkbox, Icon} from "@uva-fnwi/datanose-ui";

import {filterScreenRows} from "./filterScreenRows";
import {DataTable, TableLinkCell, TableProgressCell, TableTextCell} from "~/components/Table";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";
import {isProgressInformation} from "~/utils/progress";
import {formatTableCellValue, getComparableTableCellValue} from "~/utils/tableCellValues";

type ScreenTableProps = {
    columns: ScreenColumn[];
    rows: ScreenRow[];
    globalFilter?: string;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    showInstanceLink?: boolean;
};

export const ScreenTable = ({
    columns,
    rows,
    globalFilter = "",
    rowSelection,
    onRowSelectionChange,
    showInstanceLink = true,
}: ScreenTableProps) => {
    const {i18n, l, t} = useTranslate("workflow");
    const {t: screenT} = useTranslate("screens");
    const navigate = useVersionedNavigate();
    const filteredRows = useMemo(
        () => filterScreenRows(columns, rows, globalFilter, i18n.language),
        [columns, rows, globalFilter, i18n.language],
    );

    const tableColumns = useMemo<ColumnDef<ScreenRow>[]>(() => {
        const tableColumns = columns
            .filter((col) => col.displayType !== "ExportOnly")
            .map((col): ColumnDef<ScreenRow> => ({
                id: String(col.id),
                ...(col.isCurrentStep && col.dataType === "Object" ? {size: 220} : {}),
                accessorFn: (row) =>
                    getComparableTableCellValue(row.values[col.id], col.dataType, i18n.language),
                header: () => l(col.title),
                cell: (info) => {
                    const value = info.row.original.values[col.id];
                    const formattedValue = formatTableCellValue(value, col.dataType, i18n.language);

                    // Custom formatting for the progress column
                    if (col.isCurrentStep && col.dataType === "Object") {
                        if (isProgressInformation(value)) {
                            return <TableProgressCell progress={value} />;
                        }
                    }

                    if (col.link) {
                        const rowId = info.row.original.id;
                        return (
                            <TableLinkCell to={`/instance/${rowId}`}>
                                {formattedValue}
                            </TableLinkCell>
                        );
                    }

                    return <TableTextCell>{formattedValue}</TableTextCell>;
                },
                enableSorting: true,
            }));

        if (onRowSelectionChange) {
            tableColumns.unshift({
                id: "selection",
                size: 56,
                enableSorting: false,
                header: ({table}) => (
                    <Checkbox
                        label=""
                        aria-label={screenT("bulk.select_all")}
                        isSelected={table.getIsAllPageRowsSelected()}
                        isIndeterminate={table.getIsSomePageRowsSelected()}
                        isDisabled={table.getRowModel().rows.length === 0}
                        onChange={(selected) => table.toggleAllPageRowsSelected(selected)}
                    />
                ),
                cell: ({row}) => (
                    <Checkbox
                        label=""
                        aria-label={screenT("bulk.select_row", {number: row.index + 1})}
                        isSelected={row.getIsSelected()}
                        onChange={(selected) => row.toggleSelected(selected)}
                    />
                ),
            });
        }

        if (showInstanceLink) {
            tableColumns.push({
                id: "actions",
                size: 64,
                header: () => <span className="sr-only">{t("screens.actions")}</span>,
                enableSorting: false,
                cell: ({row}) => (
                    <div className="flex w-auto justify-end p-0">
                        <Button
                            intent="primary"
                            variant="destructive"
                            size="square"
                            width="none"
                            className="flex items-center justify-center rounded-sm text-white"
                            onClick={() => navigate(`/instance/${row.original.id}`)}
                        >
                            <Icon name="visible-line" color="current" />
                        </Button>
                    </div>
                ),
            });
        }

        return tableColumns;
    }, [columns, i18n.language, l, t, navigate, screenT, onRowSelectionChange, showInstanceLink]);

    return (
        <DataTable
            data={filteredRows}
            columns={tableColumns}
            getRowId={(row) => row.id}
            rowSelection={rowSelection}
            onRowSelectionChange={onRowSelectionChange}
        />
    );
};
