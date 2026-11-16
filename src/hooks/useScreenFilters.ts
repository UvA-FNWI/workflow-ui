import {useCallback, useMemo, useState} from "react";

import {
    type ColumnFilterValues,
    filterScreenRows,
    getPickFilters,
} from "~/components/ScreenTable/filterScreenRows";
import {useTranslate} from "~/hooks/useTranslate";
import type {ScreenRow} from "~/store/api/types/screens";

type ScreenColumns = Parameters<typeof filterScreenRows>[0];

interface UseScreenFiltersOptions {
    columns: ScreenColumns;
    rows?: ScreenRow[];
    groups?: {rows: ScreenRow[]}[];
    activeTab: number;
}

export function useScreenFilters({columns, rows, groups, activeTab}: UseScreenFiltersOptions) {
    const {i18n} = useTranslate("common");
    const language = i18n.language;

    const [search, setSearch] = useState("");
    const [columnFilters, setColumnFilters] = useState<ColumnFilterValues>({});

    const filterRows = useCallback(
        (input: ScreenRow[]) => filterScreenRows(columns, input, search, columnFilters, language),
        [columns, columnFilters, search, language],
    );

    const allRows = useMemo(
        () => (groups ? groups.flatMap((g) => g.rows) : (rows ?? [])),
        [groups, rows],
    );

    const filteredGroupRows = useMemo(
        () => groups?.map((group) => filterRows(group.rows)) ?? [],
        [groups, filterRows],
    );

    const filteredRows = useMemo(
        () => (groups ? (filteredGroupRows[activeTab] ?? []) : filterRows(rows ?? [])),
        [groups, rows, filteredGroupRows, activeTab, filterRows],
    );

    const pickFilters = useMemo(
        () => getPickFilters(columns, allRows, language),
        [columns, allRows, language],
    );

    const isFiltering = useMemo(
        () =>
            search.trim() !== "" ||
            Object.values(columnFilters).some((values) => values?.length > 0),
        [search, columnFilters],
    );

    const setColumnFilter = useCallback((name: string, values: string[]) => {
        setColumnFilters((prev) => ({...prev, [name]: values}));
    }, []);

    return {
        search,
        setSearch,
        columnFilters,
        setColumnFilter,
        isFiltering,
        pickFilters,
        filteredRows,
        filteredGroupRows,
    };
}
