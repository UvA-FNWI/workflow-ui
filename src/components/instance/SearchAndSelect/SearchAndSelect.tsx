import {useCallback, useEffect, useState} from "react";

import {LoadingSpinner, SearchInput} from "@datanose/ui";

import {SearchListBox, type SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";
import {useDebounce} from "~/hooks/useDebounce.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

type SearchAndSelectProps = {
    label?: string;
    searchValue?: string;
    placeholder?: string;
    items: SearchListBoxValue[];
    selectedKeys: Selection;
    selectionMode?: "single" | "multiple";
    onSelect: (selection: Selection) => void;
    onSearch: (query: string) => void;
    resetSearch: () => void;
    newItemKey?: string; // e.g. "new-institute"
    newItemLabel?: string;
    minSearchLength?: number;
    isLoading?: boolean;
    autoFocus?: boolean;
    addNewItemVisible?: boolean;
};

export function SearchAndSelect({
    label,
    searchValue,
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
}: SearchAndSelectProps) {
    const {t} = useTranslate("workflow");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSelected, setIsSelected] = useState(false);

    const listItems = addNewItemVisible
        ? [
              {
                  key: "new-item",
                  primaryValue: t("add_new"),
              } as SearchListBoxValue,
              ...items,
          ]
        : items;

    const performSearch = useCallback(
        (query: string) => {
            if (query.trim().length >= minSearchLength) {
                onSearch(query);
            }
        },
        [minSearchLength, onSearch],
    );
    const debouncedSearch = useDebounce(performSearch as (...args: unknown[]) => void, 300);

    useEffect(() => {
        if (searchQuery.trim().length >= minSearchLength && !isSelected) {
            resetSearch();
            debouncedSearch(searchQuery);
        }
    }, [searchQuery, minSearchLength, debouncedSearch, isSelected, resetSearch]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setIsSelected(false);
    }, []);

    const handleSelectionChange = useCallback(
        (keys: Selection) => {
            onSelect(keys);
            setIsSelected(true);

            if (keys !== "all") {
                const firstKey = Array.from(keys)[0];
                const selectedItem = items.find((i) => i.key === firstKey);
                setSearchQuery(selectedItem?.primaryValue ?? "");
            }
        },
        [onSelect, items],
    );

    const inputValue = isSelected ? (searchValue ?? "") : searchQuery;
    const showSearchHint = searchQuery.trim().length < minSearchLength;
    const showLoading = isLoading && !showSearchHint;
    const showNoResults =
        !showLoading &&
        !showSearchHint &&
        !isSelected &&
        items.length === 0 &&
        searchQuery.trim().length > 0;
    const showUsers = !showLoading && !showSearchHint && items.length > 0 && !isSelected;

    return (
        <div>
            <SearchInput
                label={label}
                placeholder={placeholder}
                onChange={handleSearchChange}
                value={inputValue}
                autoFocus={autoFocus}
            />

            {/* Search hint */}
            {showSearchHint && (
                <div className="py-8 text-center text-grey-600 dark:text-grey-400">
                    {t("user_picker.search_hint", {count: minSearchLength})}
                </div>
            )}

            {/* Loading */}
            {showLoading && (
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" />
                </div>
            )}

            {showUsers && (
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
            {showNoResults && (
                <div className="py-8 text-center text-grey-600 dark:text-grey-400">
                    {t("user_picker.no_results")}
                </div>
            )}
        </div>
    );
}
