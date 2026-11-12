import {rankItem} from "@tanstack/match-sorter-utils";

import type {LocalString} from "~/hooks/useTranslate.ts";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens";
import {formatTableCellValue, getComparableTableCellValue} from "~/utils/tableCellValues";

export type ColumnFilterValues = Record<string, string[]>;

export type Filter = {
    name: string;
    title: LocalString;
    options: string[];
};

export const getPickFilters = (
    columns: ScreenColumn[],
    rows: ScreenRow[],
    language: string,
): Filter[] =>
    columns
        .filter((col) => col.filterType === "Pick")
        .map((col) => {
            const options = new Set<string>();
            rows.forEach((row) => {
                const value = String(
                    formatTableCellValue(row.values[col.id], col.dataType, language) ?? "",
                );
                if (value) options.add(value);
            });

            return {
                name: String(col.id),
                title: col.title,
                options: [...options].sort((a, b) => a.localeCompare(b, language)),
            };
        });

export const applyColumnFilters = (
    columns: ScreenColumn[],
    rows: ScreenRow[],
    filters: ColumnFilterValues,
    language: string,
): ScreenRow[] => {
    const active = columns.filter(
        (col) => col.filterType === "Pick" && filters[String(col.id)]?.length,
    );
    if (!active.length) return rows;

    return rows.filter((row) =>
        active.every((col) => {
            const value = String(
                formatTableCellValue(row.values[col.id], col.dataType, language) ?? "",
            );
            return filters[String(col.id)].includes(value);
        }),
    );
};

export function filterScreenRows(
    columns: ScreenColumn[],
    rows: ScreenRow[],
    search: string,
    language: string,
) {
    if (!search) return rows;
    const searchableColumns = columns.filter((column) => column.displayType !== "ExportOnly");
    return rows.filter((row) =>
        searchableColumns.some(
            (column) =>
                rankItem(
                    getComparableTableCellValue(row.values[column.id], column.dataType, language),
                    search,
                ).passed,
        ),
    );
}
