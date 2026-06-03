import {useState} from "react";

import {rankItem} from "@tanstack/match-sorter-utils";
import {
    type FilterFn,
    type FilterFns,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type OnChangeFn,
    type Row,
    type SortingState,
    type TableOptions,
    useReactTable,
} from "@tanstack/react-table";
import {Icon} from "@uva-fnwi/datanose-ui";

type DataTableProps<TData> = {
    data: TData[];
    columns: TableOptions<TData>["columns"];
    getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
    globalFilter?: string;
    /** Override the default fuzzy global filter. */
    globalFilterFn?: FilterFn<TData>;
    /**
     * Provide additional named filter functions that can be referenced by globalFilterFn or column filters later.
     */
    filterFns?: FilterFns;
    initialSorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
};

export function DataTable<TData>({
    data,
    columns,
    getRowId,
    globalFilter = "",
    globalFilterFn,
    filterFns,
    initialSorting = [],
    onSortingChange,
}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>(initialSorting);

    const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
        setSorting(updater);
        if (onSortingChange) {
            const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
            onSortingChange(nextSorting);
        }
    };

    const defaultGlobalFilter: FilterFn<TData> = (row, columnId, value, addMeta) => {
        const itemRank = rankItem(row.getValue(columnId), value);
        addMeta?.({itemRank});
        return itemRank.passed;
    };

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: handleSortingChange,
        filterFns: {
            fuzzy: defaultGlobalFilter,
            ...filterFns,
        },
        globalFilterFn: globalFilterFn ?? defaultGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId,
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead className="border-b border-grey-300">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={`px-4 py-3 text-left font-body font-semibold whitespace-nowrap text-black dark:text-white ${
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
                                        {header.column.getCanSort() && (
                                            <SortIndicator
                                                direction={header.column.getIsSorted()}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className="hover:bg-grey-50 border-b border-grey-300 dark:border-grey-600 dark:hover:bg-grey-800"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-2">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

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
