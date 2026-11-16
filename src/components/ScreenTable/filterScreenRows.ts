import {rankItem} from "@tanstack/match-sorter-utils";

import type {LocalString} from "~/hooks/useTranslate.ts";
import type {FilterType, ScreenColumn, ScreenRow} from "~/store/api/types/screens";
import {formatTableCellValue, getComparableTableCellValue} from "~/utils/tableCellValues";

export type ColumnFilterValues = Record<string, string[]>;

export type Filter = {
    name: string;
    title: LocalString;
    options: string[];
};

// strip DD/MM dates, optionally wrapped in brackets: "03/09", "(18/12)"
export const stripDates = (value: string): string =>
    value
        .replace(/\s*(?:\(\s*\d{1,2}\/\d{1,2}\s*\)|\b\d{1,2}\/\d{1,2}\b)/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

const getFilterValue = (row: ScreenRow, col: ScreenColumn, language: string): string => {
    const value = String(formatTableCellValue(row.values[col.id], col.dataType, language) ?? "");
    return col.isCurrentStep ? stripDates(value) : value;
};

export const getFiltersByType = (
    columns: ScreenColumn[],
    rows: ScreenRow[],
    language: string,
    filterType: FilterType,
): Filter[] =>
    columns
        .filter((col) => col.filterType === filterType)
        .map((col) => {
            const options = new Set<string>();
            rows.forEach((row) => {
                const value = getFilterValue(row, col, language);
                if (value) options.add(value);
            });

            return {
                name: String(col.id),
                title: col.title,
                options: [...options].sort((a, b) => a.localeCompare(b, language)),
            };
        });

export function filterScreenRows(
    columns: ScreenColumn[],
    rows: ScreenRow[],
    search: string,
    filters: ColumnFilterValues,
    language: string,
) {
    const activeFilterColumns = columns.filter(
        (col) => col.filterType === "Pick" && filters[String(col.id)]?.length,
    );
    const searchableColumns = columns.filter((column) => column.displayType !== "ExportOnly");

    const searchTerm = search.trim().toLowerCase();
    if (!activeFilterColumns.length && !searchTerm) return rows;

    return rows.filter((row) => {
        const passesFilters = activeFilterColumns.every((col) =>
            filters[String(col.id)].includes(getFilterValue(row, col, language)),
        );
        if (!passesFilters) return false;
        if (!searchTerm) return true;

        return searchableColumns.some(
            (column) =>
                rankItem(
                    getComparableTableCellValue(row.values[column.id], column.dataType, language),
                    searchTerm,
                ).passed,
        );
    });
}
