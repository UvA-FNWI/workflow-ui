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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-x-12 gap-y-6">
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
        <div className="container flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <Text size="sm" className="xs:text-right w-24 shrink-0 text-left wrap-break-word">
                {l(filter.title)}
            </Text>
            <div className="min-w-0 grow basis-48">
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
