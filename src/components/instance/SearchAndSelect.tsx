import {useCallback, useEffect, useState} from "react";

import {LoadingSpinner, SearchInput} from "@datanose/ui";

import {SearchListBox, type SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";
import {useDebounce} from "~/hooks/useDebounce.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

type SearchAndSelectProps = {
    label?: string;
    placeholder?: string;
    items: SearchListBoxValue[];
    selectedKeys: Selection;
    selectionMode?: "single" | "multiple";
    onSelect: (selection: Selection) => void;
    onSearch: (query: string) => void;
    resetSearch: () => void;
    minSearchLength?: number;
    isLoading?: boolean;
    autoFocus?: boolean;
    addNewItemVisible?: boolean;
    showSearchHint?: boolean;
    searchHintText?: string;
    noResultsText?: string;
    initialSearchQuery?: string;
};

export function SearchAndSelect({
    label,
    placeholder,
    items,
    selectedKeys,
    selectionMode = "single",
    onSelect,
    onSearch,
    resetSearch,
    minSearchLength = 2,
    isLoading = false,
    autoFocus = false,
    addNewItemVisible = false,
    showSearchHint: showSearchHintEnabled = true,
    searchHintText,
    noResultsText,
    initialSearchQuery = "",
}: SearchAndSelectProps) {
    const {t} = useTranslate("workflow");
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [isSelected, setIsSelected] = useState(initialSearchQuery != "");
    const [isPendingSearch, setIsPendingSearch] = useState(false);

    const listItems = addNewItemVisible
        ? [
              {
                  key: "new-item",
                  primaryValue: t("search_and_select.add_new"),
              } as SearchListBoxValue,
              ...items,
          ]
        : items;

    const performSearch = useCallback(
        (query: string) => {
            if (query.trim().length >= minSearchLength) {
                onSelect(new Set());
                onSearch(query);
            }
            setIsPendingSearch(false);
        },
        [minSearchLength, onSearch, onSelect],
    );
    const debouncedSearch = useDebounce(performSearch as (...args: unknown[]) => void, 300);

    useEffect(() => {
        if (searchQuery.trim().length >= minSearchLength && !isSelected) {
            resetSearch();
            debouncedSearch(searchQuery);
        }
    }, [searchQuery, minSearchLength, debouncedSearch, isSelected, resetSearch]);

    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchQuery(query);
            setIsSelected(false);
            setIsPendingSearch(query.trim().length >= minSearchLength);
        },
        [minSearchLength],
    );

    const handleSelectionChange = useCallback(
        (keys: Selection) => {
            onSelect(keys);
            setIsSelected(true);

            if (keys !== "all") {
                const firstKey = Array.from(keys)[0];
                if (firstKey === "new-item") {
                    setSearchQuery(t("search_and_select.add_new"));
                } else {
                    const selectedItem = items.find((i) => i.key === firstKey);
                    setSearchQuery(selectedItem?.primaryValue ?? "");
                }
            }
        },
        [onSelect, t, items],
    );

    const getPickerState = () => {
        const trimmed = searchQuery.trim().length;
        const meetsMinSearchLength = trimmed >= minSearchLength;

        if (isSelected) return "selected";
        if (showSearchHintEnabled && !meetsMinSearchLength) return "hint";
        if (isLoading || isPendingSearch) return "loading";
        if (meetsMinSearchLength && items.length > 0) return "results";
        if (meetsMinSearchLength && addNewItemVisible && items.length === 0)
            return "no-results-add-new";
        if (meetsMinSearchLength && items.length === 0) return "no-results";
    };

    const state = getPickerState();

    return (
        <div>
            <SearchInput
                label={label}
                placeholder={placeholder ?? t("search_and_select.search_placeholder")}
                onChange={handleSearchChange}
                value={searchQuery}
                autoFocus={autoFocus}
            />

            {/* Search hint */}
            {state === "hint" && (
                <div className="py-8 text-center text-grey-600 dark:text-grey-400">
                    {searchHintText ?? t("search_and_select.search_hint")}
                </div>
            )}

            {/* Loading */}
            {state === "loading" && (
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
                </div>
            )}

            {(state === "results" || state === "no-results-add-new") && (
                <SearchListBox
                    autoFocus={false}
                    items={listItems}
                    selectedKeys={selectedKeys}
                    onSelectionChange={handleSelectionChange}
                    selectionMode={selectionMode}
                    aria-label={label}
                />
            )}
            {/* No results */}
            {(state === "no-results" || state === "no-results-add-new") && (
                <div className="py-8 text-center text-grey-600 dark:text-grey-400">
                    {noResultsText ?? t("search_and_select.no_results")}
                </div>
            )}
        </div>
    );
}
