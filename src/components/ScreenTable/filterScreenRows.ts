import {rankItem} from "@tanstack/match-sorter-utils";

import type {LocalString} from "~/hooks/useTranslate.ts";
import type {FilterType, ScreenColumn, ScreenRow} from "~/store/api/types/screens";
import {isProgressInformation} from "~/utils/progress.ts";
import {formatTableCellValue, getComparableTableCellValue} from "~/utils/tableCellValues";

export type ColumnFilterValues = Record<string, string[]>;

export type Filter = {
    name: string;
    title: LocalString;
    options: FilterOption[];
};

export interface FilterOption {
    key: string;
    label: string;
}

// strip DD/MM dates, optionally wrapped in brackets: "03/09", "(18/12)"
export const stripDates = (value: string): string =>
    value
        .replace(/\s*(?:\(\s*\d{1,2}\/\d{1,2}\s*\)|\b\d{1,2}\/\d{1,2}\b)/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

const getFilterKey = (raw: unknown, col: ScreenColumn): string => {
    const value = isProgressInformation(raw) ? raw.text : raw;
    const text =
        typeof value === "object" && value !== null
            ? ((value as Record<string, string>).en ?? "")
            : String(value ?? "");
    return col.isCurrentStep ? stripDates(text) : text;
};

const getFilterOption = (row: ScreenRow, col: ScreenColumn, language: string): FilterOption => {
    const raw = row.values[col.id];
    const label = String(formatTableCellValue(raw, col.dataType, language) ?? "");
    return {
        key: getFilterKey(raw, col),
        label: col.isCurrentStep ? stripDates(label) : label,
    };
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
            const options = new Map<string, FilterOption>();
            rows.forEach((row) => {
                const option = getFilterOption(row, col, language);
                if (option.key && !options.has(option.key)) options.set(option.key, option);
            });

            return {
                name: String(col.id),
                title: col.title,
                options: [...options.values()].sort((a, b) =>
                    a.label.localeCompare(b.label, language),
                ),
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
            filters[String(col.id)].includes(getFilterKey(row.values[col.id], col)),
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
