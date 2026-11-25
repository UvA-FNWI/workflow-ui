import {useCallback, useMemo, useState} from "react";

import {SearchAndSelect} from "~/components/instance/SearchAndSelect.tsx";
import {type SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {UserSearchField, UserSearchResult} from "~/store/api/types/users";
import {useLazyFindUsersQuery, useLazySearchFieldUsersQuery} from "~/store/api/usersApi";

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
    includeStudents?: boolean;
    field?: UserSearchField;
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
    includeStudents,
    field,
    showSelectedEmail = false,
}) => {
    const {t} = useTranslate("workflow");
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const [triggerSearch, searchState] = useLazyFindUsersQuery();
    const [triggerFieldSearch, fieldSearchState] = useLazySearchFieldUsersQuery();
    const activeSearchState = field ? fieldSearchState : searchState;
    const fieldSearchArgs = fieldSearchState.originalArgs;
    const isCurrentField =
        field != null &&
        fieldSearchArgs?.instanceId === field.instanceId &&
        fieldSearchArgs.submissionId === field.submissionId &&
        fieldSearchArgs.property === field.property;
    const groups = isCurrentField ? fieldSearchState.currentData : undefined;
    const searchResults = useMemo(
        () =>
            field ? (groups ?? []).flatMap(({users}) => users) : (searchState.currentData ?? []),
        [field, groups, searchState.currentData],
    );

    const searchListBoxValues: SearchListBoxValue[] = useMemo(() => {
        return searchResults.map((user) => {
            const hasMatchingDetails = searchResults.some(
                (other) =>
                    other.userName !== user.userName &&
                    other.displayName === user.displayName &&
                    other.email === user.email,
            );
            return {
                key: user.userName,
                primaryValue: user.displayName,
                secondaryValue: hasMatchingDetails
                    ? `${user.userName} | ${user.email}`
                    : user.email,
                tertiaryValue: user.organization?.name,
            };
        });
    }, [searchResults]);

    const usersCache = useMemo(() => {
        const cache = new Map<string, UserSearchResult>();
        initialSelection.forEach((user) => cache.set(user.userName, user));
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
        },
        [usersCache, onSelectionChange],
    );

    const searchPlaceholderText = searchPlaceholder ?? t("user_picker.search_placeholder");
    const handleSearch = useCallback(
        (query: string) => {
            if (field) {
                triggerFieldSearch({...field, query});
                return;
            }
            triggerSearch({
                query,
                includeExternalUsers: allowsExternalUsers ?? false,
                includeEmployees: includeStudents ? true : undefined,
                includeStudents,
            });
        },
        [allowsExternalUsers, field, includeStudents, triggerFieldSearch, triggerSearch],
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
            resetSearch={activeSearchState.reset}
            placeholder={searchPlaceholderText}
            autoFocus={autoFocus}
            selectionMode={selectionMode}
            minSearchLength={minSearchLength}
            isLoading={activeSearchState.isLoading || activeSearchState.isFetching}
            initialSearchQuery={initialSearchQuery}
            noResultsText={t("user_picker.no_results")}
            showSearchHint={showSearchHint}
            searchHintText={
                selectionMode == "single"
                    ? t("user_picker.search_hint_one")
                    : t("user_picker.search_hint_other")
            }
        />
    );
};
