import {useId, useRef, useState} from "react";

import {
    Button,
    Checkbox,
    Icon,
    Popover,
    SearchInput,
    Text,
    usePopoverState,
} from "@uva-fnwi/datanose-ui";

import type {ColumnFilterValues, Filter} from "~/components/ScreenTable/filterScreenRows.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";

type ScreenTableFiltersProps = {
    filters: Filter[];
    values: ColumnFilterValues;
    onFilterChange: (name: string, value: string[]) => void;
    onClearFilters: () => void;
};

export const ScreenTableFilters = ({
    filters,
    values,
    onFilterChange,
    onClearFilters,
}: ScreenTableFiltersProps) => {
    const {t} = useTranslate("screens");
    if (!filters.length) return null;

    return (
        <div className="mt-4 flex flex-col gap-2 bg-grey-200 px-4 pt-4 pb-8">
            <div className="flex items-center justify-between gap-2">
                <Text fontWeight="semibold" size="sm">
                    {t("filters.title")}
                </Text>
                <Button
                    intent="ghost"
                    className="underline"
                    disabled={!Object.values(values).some((selection) => selection.length)}
                    onClick={onClearFilters}
                >
                    {t("filters.clear_all")}
                </Button>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] items-start gap-x-12 gap-y-6">
                {filters.map((filter) => (
                    <ColumnFilterPicker
                        key={filter.name}
                        filter={filter}
                        selected={values[filter.name] ?? []}
                        onChange={(selection) => onFilterChange(filter.name, selection)}
                    />
                ))}
            </div>
        </div>
    );
};

type ColumnFilterPickerProps = {
    filter: Filter;
    selected: string[];
    onChange: (values: string[]) => void;
};

function ColumnFilterPicker({filter, selected, onChange}: ColumnFilterPickerProps) {
    const {
        t,
        l,
        i18n: {language},
    } = useTranslate("screens");
    const popover = usePopoverState();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dialogId = useId();
    const summaryId = `${dialogId}-summary`;
    const [search, setSearch] = useState("");
    const title = l(filter.title) ?? filter.name;
    const selectedKeys = new Set(selected);
    const query = search.trim().toLocaleLowerCase(language);
    const matches = query
        ? filter.options.filter(({label}) => label.toLocaleLowerCase(language).includes(query))
        : filter.options;
    const matchingSelectedCount = matches.filter(({key}) => selectedKeys.has(key)).length;
    const allMatchesSelected = matches.length > 0 && matchingSelectedCount === matches.length;
    const outsideCount = selected.length - matchingSelectedCount;
    const summary = t("filters.selected_summary", {nr: selected.length});

    function selectMatches(isSelected: boolean) {
        const next = new Set(selected);
        for (const {key} of matches) {
            if (isSelected) next.add(key);
            else next.delete(key);
        }
        onChange([...next]);
    }

    return (
        <div className="grid min-w-0 items-start gap-x-4 gap-y-2 sm:grid-cols-[6rem_minmax(0,1fr)]">
            <Text size="sm" className="wrap-break-word sm:pt-2 sm:text-right">
                {title}
            </Text>
            <button
                ref={triggerRef}
                type="button"
                aria-label={title}
                aria-describedby={summaryId}
                aria-haspopup="dialog"
                aria-expanded={popover.isOpen}
                aria-controls={popover.isOpen ? dialogId : undefined}
                className="flex min-h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-xs border border-grey-600 bg-grey-100 px-3 py-2 text-left text-sm hover:border-grey-800 focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-grey-400 dark:bg-grey-900 dark:focus-visible:ring-orange-500"
                onClick={() => {
                    setSearch("");
                    popover.toggle();
                }}
            >
                <span id={summaryId} className="truncate">
                    {selected.length ? summary : t("filters.choose")}
                </span>
                <Icon name="chevron-down-small-line" size="sm" color="secondary" decorative />
            </button>
            {popover.isOpen && (
                <Popover
                    state={popover}
                    triggerRef={triggerRef}
                    placement="bottom start"
                    shouldFlip
                    className="my-1 w-96 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xs border border-grey-300 bg-white shadow-lg dark:border-grey-600 dark:bg-grey-900"
                >
                    <dialog
                        open
                        id={dialogId}
                        aria-modal="true"
                        aria-label={title}
                        className="relative m-0 w-full bg-transparent text-inherit"
                    >
                        <div className="p-3">
                            <SearchInput
                                label={t("filters.search_options")}
                                value={search}
                                onChange={setSearch}
                                size="md"
                                autoFocus
                            />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-grey-300 px-3 py-2 dark:border-grey-600">
                            <Checkbox
                                label={
                                    query
                                        ? t("filters.select_all_results")
                                        : t("filters.select_all")
                                }
                                isSelected={allMatchesSelected}
                                isIndeterminate={matchingSelectedCount > 0 && !allMatchesSelected}
                                isDisabled={!matches.length}
                                onChange={selectMatches}
                            />
                            <Text size="sm" intent="secondary">
                                {t("filters.matches", {count: matches.length})}
                            </Text>
                        </div>
                        <div
                            className="max-h-52 overflow-y-auto py-1"
                            role="group"
                            aria-label={title}
                        >
                            {matches.map(({key, label}) => {
                                const isSelected = selectedKeys.has(key);
                                return (
                                    <Checkbox
                                        key={key}
                                        label={label}
                                        isSelected={isSelected}
                                        className={`flex w-full px-3 py-2 wrap-anywhere focus-within:inset-ring-2 focus-within:inset-ring-navy-600 hover:bg-grey-200 dark:focus-within:inset-ring-orange-500 dark:hover:bg-grey-800 ${isSelected ? "bg-grey-300 dark:bg-grey-700" : ""}`}
                                        onChange={(checked) =>
                                            onChange(
                                                checked
                                                    ? [...selected, key]
                                                    : selected.filter((value) => value !== key),
                                            )
                                        }
                                    />
                                );
                            })}
                            {matches.length === 0 && (
                                <Text size="sm" className="px-3 py-2">
                                    {t("filters.no_matches")}
                                </Text>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 border-t border-grey-300 p-3 dark:border-grey-600">
                            <div
                                className="flex flex-wrap items-center justify-between gap-x-2"
                                role="status"
                            >
                                <Text size="sm" fontWeight="semibold">
                                    {summary}
                                </Text>
                                {outsideCount > 0 && (
                                    <Text size="sm" intent="secondary">
                                        {t("filters.outside_search", {nr: outsideCount})}
                                    </Text>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <Button
                                    intent="ghost"
                                    className="underline"
                                    aria-disabled={!selected.length}
                                    onClick={selected.length ? () => onChange([]) : undefined}
                                >
                                    {t("filters.clear_selection")}
                                </Button>
                                <Button
                                    intent="primary"
                                    variant="destructive"
                                    onClick={popover.close}
                                >
                                    {t("filters.done")}
                                </Button>
                            </div>
                        </div>
                    </dialog>
                </Popover>
            )}
        </div>
    );
}
