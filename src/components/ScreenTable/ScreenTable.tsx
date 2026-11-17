import {useMemo} from "react";

import {type ColumnDef, type OnChangeFn, type RowSelectionState} from "@tanstack/react-table";
import {Button, Checkbox, Icon} from "@uva-fnwi/datanose-ui";

import {filterScreenRows} from "./filterScreenRows";
import {DataTable, TableLinkCell, TableProgressCell, TableTextCell} from "~/components/Table";
import {TableStaffCell} from "~/components/Table/TableStaffCell.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import {useVersionedNavigate} from "~/hooks/useVersionedNavigate";
import type {ScreenColumn, ScreenRelatedUser, ScreenRow} from "~/store/api/types/screens";
import {isProgressInformation, isStopped} from "~/utils/progress";
import {formatTableCellValue, getComparableTableCellValue} from "~/utils/tableCellValues";

type ScreenTableProps = {
    columns: ScreenColumn[];
    rows: ScreenRow[];
    globalFilter?: string;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    showInstanceLink?: boolean;
};

function isStoppedRow(row: ScreenRow, progressColumnId: number | undefined): boolean {
    const progress = progressColumnId === undefined ? undefined : row.values[progressColumnId];
    return isStopped(
        row.workflowStopped,
        isProgressInformation(progress) ? progress.stopEvent : null,
    );
}

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
    const progressColumnId = columns.find((column) => column.columnType === "CurrentStep")?.id;
    const filteredRows = useMemo(
        () => filterScreenRows(columns, rows, globalFilter, i18n.language),
        [columns, rows, globalFilter, i18n.language],
    );

    const tableColumns = useMemo<ColumnDef<ScreenRow>[]>(() => {
        const tableColumns = columns
            .filter((col) => col.displayType !== "ExportOnly")
            .map((col): ColumnDef<ScreenRow> => ({
                id: String(col.id),
                ...(col.columnType === "CurrentStep" && col.dataType === "Object"
                    ? {size: 220}
                    : {}),
                accessorFn: (row) => {
                    const value = row.values[col.id];
                    if (col.columnType === "RelatedUsers") {
                        return getComparableTableCellValue(
                            (value as ScreenRelatedUser[])
                                .map((user) => user.displayName)
                                .join(", "),
                            "String",
                            i18n.language,
                        );
                    }
                    return getComparableTableCellValue(
                        row.values[col.id],
                        col.dataType,
                        i18n.language,
                    );
                },
                header: () => l(col.title),
                cell: (info) => {
                    const row = info.row.original;
                    const value = row.values[col.id];
                    const strikeThrough =
                        isStoppedRow(row, progressColumnId) &&
                        col.property !== "Student.DisplayName" &&
                        col.columnType !== "CurrentStep";
                    const textClassName = strikeThrough ? "line-through" : undefined;
                    if (col.columnType === "RelatedUsers") {
                        const users = value as ScreenRelatedUser[];
                        if (!users.length) {
                            return <TableTextCell className={textClassName}>—</TableTextCell>;
                        }
                        return <TableStaffCell users={users} textClassName={textClassName} />;
                    }
                    const formattedValue = formatTableCellValue(value, col.dataType, i18n.language);

                    // Custom formatting for the progress column
                    if (col.columnType === "CurrentStep" && col.dataType === "Object") {
                        if (isProgressInformation(value)) {
                            return (
                                <TableProgressCell
                                    progress={value}
                                    workflowStopped={row.workflowStopped}
                                />
                            );
                        }
                    }

                    if (col.link) {
                        return (
                            <TableLinkCell to={`/instance/${row.id}`}>
                                {strikeThrough ? (
                                    <span className="line-through">{formattedValue}</span>
                                ) : (
                                    formattedValue
                                )}
                            </TableLinkCell>
                        );
                    }

                    return (
                        <TableTextCell className={textClassName}>{formattedValue}</TableTextCell>
                    );
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
    }, [
        columns,
        i18n.language,
        l,
        t,
        navigate,
        screenT,
        onRowSelectionChange,
        progressColumnId,
        showInstanceLink,
    ]);

    return (
        <DataTable
            data={filteredRows}
            columns={tableColumns}
            getRowId={(row) => row.id}
            placeLast={(row) => isStoppedRow(row, progressColumnId)}
            rowSelection={rowSelection}
            onRowSelectionChange={onRowSelectionChange}
            stickyFirstColumn={Boolean(onRowSelectionChange)}
        />
    );
};
