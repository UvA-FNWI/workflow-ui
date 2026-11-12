import {type Key, useState} from "react";

import {Item, Select, Text} from "@uva-fnwi/datanose-ui";

import {type LocalString, useTranslate} from "~/hooks/useTranslate.ts";

type Filter = {
    name: string;
    title: LocalString;
    options: string[];
};

type ScreenTableFiltersProps = {
    filters: Filter[];
    onFilterChange: (name: string, value: string[]) => void;
};

export const ScreenTableFilters = ({filters, onFilterChange}: ScreenTableFiltersProps) => {
    filters = [
        {name: "vakcode", title: {en: "Course code", nl: "Vakcode"}, options: ["12345", "67890"]},
        {
            name: "Opleiding",
            title: {en: "Programme", nl: "Opleiding"},
            options: ["MSc Biomedische wetenschappen", "MSc Software Engineering"],
        },
    ];
    return (
        <div className="mt-4 flex flex-col gap-2 bg-grey-200 px-4 pt-4 pb-8">
            <Text fontWeight="semibold">Filters</Text>
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                {filters.map((filter) => (
                    <ScreenTableFilter
                        filter={filter}
                        onFilterChange={onFilterChange}
                        key={filter.name}
                    />
                ))}
            </div>
        </div>
    );
};

type ScreenTableFilterProps = {
    filter: Filter;
    onFilterChange: (name: string, values: string[]) => void;
};

const ScreenTableFilter = ({filter, onFilterChange}: ScreenTableFilterProps) => {
    const {t, l} = useTranslate("screens");
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const handleFilterChange = (keys: Key[]) => {
        const values = keys.map(String);
        setSelectedFilters(values);
        onFilterChange(filter.name, values);
    };

    return (
        <div key={filter.name} className="flex min-w-0 flex-1 items-center gap-6">
            <Text className="shrink-0">{l(filter.title)}</Text>
            <div className="w-2/3 min-w-0">
                <Select
                    value={selectedFilters}
                    onChange={handleFilterChange}
                    placeholder={t("filters.choose")}
                    aria-label={l(filter.title)}
                    selectionMode="multiple"
                >
                    {filter.options.map((option) => (
                        <Item key={option}>{option}</Item>
                    ))}
                </Select>
            </div>
        </div>
    );
};
