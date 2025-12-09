import {useMemo, useState} from "react";

import {Icon} from "@datanose/ui";
import {rankItem} from "@tanstack/match-sorter-utils";
import {
    type ColumnDef,
    type FilterFn,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";

import {useTranslate} from "~/hooks/useTranslate";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";

const fuzzyFilter: FilterFn<ScreenRow> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({itemRank});

    // Return if the item should be filtered in/out
    return itemRank.passed;
};

type ScreenTableProps = {
    columns: ScreenColumn[];
    rows: ScreenRow[];
    globalFilter?: string;
};

export const ScreenTable = ({columns, rows, globalFilter = ""}: ScreenTableProps) => {
    const {l} = useTranslate();
    const [sorting, setSorting] = useState<SortingState>([]);

    const tableColumns = useMemo<ColumnDef<ScreenRow>[]>(
        () =>
            columns
                .filter((col) => col.displayType !== "ExportOnly")
                .map((col) => ({
                    id: String(col.id),
                    accessorFn: (row) => row.values[col.id],
                    header: () => l(col.title),
                    cell: (info) => {
                        const value = info.getValue();
                        return formatCellValue(value, col.dataType);
                    },
                    enableSorting: true,
                })),
        [columns, l],
    );

    const table = useReactTable({
        data: rows,
        columns: tableColumns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        globalFilterFn: fuzzyFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead className="border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={`px-4 py-3 text-left font-medium whitespace-nowrap text-gray-500 dark:text-gray-300 ${
                                        header.column.getCanSort()
                                            ? "cursor-pointer select-none"
                                            : ""
                                    }`}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className="flex items-center gap-1">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                        <SortIndicator direction={header.column.getIsSorted()} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="border-b border-gray-100 px-4 py-3">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SortIndicator = ({direction}: {direction: false | "asc" | "desc"}) => {
    if (!direction) {
        return <Icon name="chevron-grabber-vertical-line" size="sm" decorative />;
    }
    return (
        <Icon
            name={direction === "asc" ? "chevron-up-small-line" : "chevron-down-small-line"}
            size="sm"
            decorative
        />
    );
};

function formatCellValue(value: unknown, dataType: string): React.ReactNode {
    if (value === null || value === undefined) {
        return "—";
    }

    switch (dataType) {
        case "Date":
            return formatDate(value);
        case "DateTime":
            return formatDateTime(value);
        case "Currency":
            return formatCurrency(value);
        case "Double":
            return typeof value === "number" ? value.toLocaleString() : String(value);
        case "Int":
            return typeof value === "number" ? value.toLocaleString() : String(value);
        default:
            return String(value);
    }
}

function formatDate(value: unknown): string {
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
        }
    }
    return String(value);
}

function formatDateTime(value: unknown): string {
    if (typeof value === "string" || typeof value === "number") {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString();
        }
    }
    return String(value);
}

function formatCurrency(value: unknown): string {
    if (typeof value === "number") {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "EUR",
        }).format(value);
    }
    return String(value);
}
