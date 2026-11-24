import {rankings, rankItem} from "@tanstack/match-sorter-utils";

import type {LocalString} from "~/hooks/useTranslate.ts";
import type {
    FilterType,
    ScreenColumn,
    ScreenRelatedUser,
    ScreenRow,
} from "~/store/api/types/screens";
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

export const EMPTY_FILTER_KEY = "__empty__";
const EMPTY_OPTION: FilterOption = {key: EMPTY_FILTER_KEY, label: "—"};

const getFilterKey = (raw: unknown): string => {
    const value = isProgressInformation(raw) ? raw.text : raw;
    if (value == null) return "";
    const text = typeof value === "object" ? (value as Record<string, string>).en : String(value);
    return text?.trim() ?? "";
};

const getItemKey = (item: unknown, col: ScreenColumn): string => {
    if (col.columnType === "RelatedUsers") {
        const user = item as Partial<ScreenRelatedUser> | null;
        return user?.displayName?.trim() || user?.userName?.trim() || "";
    }

    return getFilterKey(item);
};

const getFilterOptions = (row: ScreenRow, col: ScreenColumn, language: string): FilterOption[] => {
    const raw = row.values[col.id];

    if (Array.isArray(raw)) {
        const keys = raw.map((item) => getItemKey(item, col)).filter(Boolean);
        return keys.length ? keys.map((key) => ({key, label: key})) : [EMPTY_OPTION];
    }

    const key = getFilterKey(raw);
    if (!key) return [EMPTY_OPTION];

    const label = String(formatTableCellValue(raw, col.dataType, language) ?? "").trim();
    return [{key, label: label || key}];
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
                getFilterOptions(row, col, language).forEach((option) => {
                    if (option.key && !options.has(option.key)) options.set(option.key, option);
                });
            });

            return {
                name: String(col.id),
                title: col.title,
                options: [...options.values()].sort((a, b) => {
                    if (a.key === EMPTY_FILTER_KEY) return 1;
                    if (b.key === EMPTY_FILTER_KEY) return -1;
                    return a.label.localeCompare(b.label, language);
                }),
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
        const passesFilters = activeFilterColumns.every((col) => {
            const selected = filters[String(col.id)];
            return getFilterOptions(row, col, language).some(({key}) => selected.includes(key));
        });
        if (!passesFilters) return false;
        if (!searchTerm) return true;

        return searchableColumns.some(
            (column) =>
                rankItem(
                    getComparableTableCellValue(row.values[column.id], column.dataType, language),
                    searchTerm,
                    {threshold: rankings.CONTAINS},
                ).passed,
        );
    });
}
