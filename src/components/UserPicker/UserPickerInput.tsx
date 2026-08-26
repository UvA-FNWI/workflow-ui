import {useCallback, useMemo, useRef, useState} from "react";

import {SearchAndSelect} from "~/components/instance/SearchAndSelect.tsx";
import {type SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {UserSearchResult} from "~/store/api/types/users";
import {useLazyFindUsersQuery} from "~/store/api/usersApi";

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

export interface UserPickerInputProps {
    initialSelection?: UserSearchResult[];
    selectionMode?: "single" | "multiple";
    onSelectionChange?: (users: UserSearchResult[]) => void;
    searchPlaceholder?: string;
    showSearchHint?: boolean;
    minSearchLength?: number;
    allowsExternalUsers?: boolean;
    autoFocus?: boolean;
    showSelectedEmail?: boolean;
}

export const UserPickerInput: React.FC<UserPickerInputProps> = ({
    initialSelection = [],
    selectionMode = "single",
    onSelectionChange,
    searchPlaceholder,
    showSearchHint = false,
    minSearchLength,
    autoFocus,
    allowsExternalUsers,
    showSelectedEmail = false,
}) => {
    const {t} = useTranslate("workflow");
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const [triggerSearch, searchState] = useLazyFindUsersQuery();
    const resetSearch = searchState.reset;
    const includeExternalUsers = allowsExternalUsers ?? false;
    const searchResults = useMemo(() => {
        const results = searchState.data ?? [];
        return includeExternalUsers ? results : results.filter((user) => !user.isExternal);
    }, [includeExternalUsers, searchState.data]);

    const searchListBoxValues: SearchListBoxValue[] = useMemo(() => {
        return searchResults.map((user) => ({
            key: user.userName,
            primaryValue: user.displayName,
            secondaryValue: user.email,
            tertiaryValue: user.organization?.name,
        }));
    }, [searchResults]);

    // Store all encountered users
    const usersCache = useMemo(() => {
        const cache = new Map<string, UserSearchResult>();

        // Add initial selection
        initialSelection.forEach((user) => cache.set(user.userName, user));

        // Add search results
        searchResults.forEach((user) => cache.set(user.userName, user));

        return cache;
    }, [searchResults, initialSelection]);

    const handleSelectionChange = useCallback(
        (keys: Selection) => {
            setSelectedKeys(keys);
            const selected =
                keys === "all"
                    ? Array.from(usersCache.values())
                    : Array.from(keys)
                          .map((key) => usersCache.get(key as string))
                          .filter((user): user is UserSearchResult => user !== undefined);

            onSelectionChange?.(selected);

            if (
                selectionMode === "single" &&
                keys !== "all" &&
                keys.size > 0 &&
                selected.length > 0
            ) {
                confirmButtonRef.current?.focus();
            }
        },
        [selectionMode, usersCache, onSelectionChange],
    );

    const searchPlaceholderText = searchPlaceholder ?? t("user_picker.search_placeholder");
    const handleSearch = useCallback(
        (query: string) => {
            triggerSearch({query, includeExternalUsers});
        },
        [includeExternalUsers, triggerSearch],
    );

    const initialSearchQuery =
        initialSelection.length > 0 && showSelectedEmail
            ? `${initialSelection[0]?.displayName} | ${initialSelection[0]?.email}`
            : initialSelection[0]?.displayName;

    return (
        <SearchAndSelect
            items={searchListBoxValues}
            selectedKeys={selectedKeys}
            onSelect={handleSelectionChange}
            onSearch={handleSearch}
            resetSearch={resetSearch}
            placeholder={searchPlaceholderText}
            autoFocus={autoFocus}
            selectionMode={selectionMode}
            minSearchLength={minSearchLength}
            isLoading={searchState.isLoading || searchState.isFetching}
            initialSearchQuery={initialSearchQuery}
            noResultsText={t("user_picker.no_results")}
            showSearchHint={showSearchHint}
            searchHintText={
                selectionMode == "single"
                    ? t("user_picker.search_hint_one")
                    : t("user_picker.search_hint_other")
            }
            aria-label={t("user_picker.title")}
        />
    );
};
