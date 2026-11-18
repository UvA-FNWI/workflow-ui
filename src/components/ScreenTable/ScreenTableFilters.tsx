import {type Key} from "react";

import {ComboBox, ComboBoxItem, Text} from "@uva-fnwi/datanose-ui";

import type {ColumnFilterValues, Filter} from "~/components/ScreenTable/filterScreenRows.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";

type ScreenTableFiltersProps = {
    filters: Filter[];
    values: ColumnFilterValues;
    onFilterChange: (name: string, value: string[]) => void;
};

export const ScreenTableFilters = ({filters, values, onFilterChange}: ScreenTableFiltersProps) => {
    const {t} = useTranslate("screens");
    if (!filters.length) return null;
    return (
        <div className="mt-4 flex flex-col gap-2 bg-grey-200 px-4 pt-4 pb-8">
            <Text fontWeight="semibold" size="sm">
                {t("filters.title")}
            </Text>
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                {filters.map((filter) => (
                    <ScreenTableFilter
                        filter={filter}
                        onFilterChange={onFilterChange}
                        key={filter.name}
                        selected={values[filter.name] ?? []}
                    />
                ))}
            </div>
        </div>
    );
};

type ScreenTableFilterProps = {
    filter: Filter;
    selected: string[];
    onFilterChange: (name: string, values: string[]) => void;
};

const ScreenTableFilter = ({filter, selected, onFilterChange}: ScreenTableFilterProps) => {
    const {t, l} = useTranslate("screens");

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <Text size="sm" className="shrink-0">
                {l(filter.title)}
            </Text>
            <div className="min-w-0 md:w-2/3">
                <ComboBox
                    value={selected}
                    onChange={(keys: Key[]) => onFilterChange(filter.name, keys.map(String))}
                    placeholder={t("filters.choose")}
                    aria-label={l(filter.title)}
                    selectionMode="multiple"
                    selectedSummary={(count: number) =>
                        `${t("filters.selected_summary", {nr: count})}`
                    }
                >
                    {filter.options.map((option) => (
                        <ComboBoxItem key={option.key}>{option.label}</ComboBoxItem>
                    ))}
                </ComboBox>
            </div>
        </div>
    );
};
