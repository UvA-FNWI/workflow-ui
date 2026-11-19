import {useCallback, useMemo, useState} from "react";

import {
    type ColumnFilterValues,
    filterScreenRows,
    getFiltersByType,
} from "~/components/ScreenTable/filterScreenRows.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {ScreenColumn, ScreenRow} from "~/store/api/types/screens.ts";

interface UseScreenFiltersOptions {
    columns: ScreenColumn[];
    rows?: ScreenRow[];
    groups?: {rows: ScreenRow[]}[];
}

export function useScreenFilters({columns, rows, groups}: UseScreenFiltersOptions) {
    const {i18n} = useTranslate("common");
    const language = i18n.language;

    const [search, setSearch] = useState("");
    const [columnFilters, setColumnFilters] = useState<ColumnFilterValues>({});

    // A screen without groups is treated as a single group
    const rowGroups = useMemo(() => groups?.map((g) => g.rows) ?? [rows ?? []], [groups, rows]);

    const filteredGroupRows = useMemo(
        () =>
            rowGroups.map((groupRows) =>
                filterScreenRows(columns, groupRows, search, columnFilters, language),
            ),
        [rowGroups, columns, search, columnFilters, language],
    );

    const pickTypeFilters = useMemo(
        () => getFiltersByType(columns, rowGroups.flat(), language, "Pick"),
        [columns, rowGroups, language],
    );

    const isFiltering =
        search.trim() !== "" || Object.values(columnFilters).some((values) => values?.length > 0);

    const setColumnFilter = useCallback((name: string, values: string[]) => {
        setColumnFilters((prev) => ({...prev, [name]: values}));
    }, []);

    return {
        search,
        setSearch,
        columnFilters,
        setColumnFilter,
        isFiltering,
        pickTypeFilters,
        filteredGroupRows,
    };
}
