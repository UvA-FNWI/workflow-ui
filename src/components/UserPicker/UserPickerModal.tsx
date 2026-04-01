import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Button, Icon, LoadingSpinner, Modal, SearchInput} from "@datanose/ui";

import {SearchListBox, type SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";
import {useDebounce} from "~/hooks/useDebounce";
import {useTranslate} from "~/hooks/useTranslate";
import type {UserSearchResult} from "~/store/api/types/users";
import {useLazyFindUsersQuery} from "~/store/api/usersApi";

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

export interface UserPickerModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    initialSelection?: UserSearchResult[];
    onConfirm: (users: UserSearchResult[]) => void;
    selectionMode?: "single" | "multiple";
    title?: string;
    searchPlaceholder?: string;
    minSearchLength?: number;
}

export const UserPickerModal: React.FC<UserPickerModalProps> = ({
    isOpen,
    onOpenChange,
    initialSelection = [],
    onConfirm,
    selectionMode = "single",
    title,
    searchPlaceholder,
    minSearchLength = 2,
}) => {
    const {t} = useTranslate("workflow");
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
    const [isSelected, setIsSelected] = useState(false);

    const [triggerSearch, searchState] = useLazyFindUsersQuery();
    const resetSearch = searchState.reset;
    const searchResults = useMemo(() => searchState.data ?? [], [searchState]);

    const searchListBoxValues: SearchListBoxValue[] = useMemo(() => {
        return searchResults.map((user) => ({
            key: user.userName,
            primaryValue: user.displayName,
            secondaryValue: user.faculty ?? user.email,
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

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialKeys = new Set(initialSelection.map((u) => u.userName));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedKeys(initialKeys);
            setSearchQuery("");
            resetSearch();
            setIsSelected(false);
        }
    }, [initialSelection, isOpen, resetSearch]);

    // Debounced search
    const performSearch = useCallback(
        (...args: unknown[]) => {
            const query = args[0] as string;
            if (query.trim().length >= minSearchLength) {
                triggerSearch(query);
            }
        },
        [minSearchLength, triggerSearch],
    );

    const debouncedSearch = useDebounce(performSearch, 300);

    useEffect(() => {
        if (searchQuery.trim().length >= minSearchLength && !isSelected) {
            resetSearch();
            debouncedSearch(searchQuery);
        }
    }, [searchQuery, minSearchLength, debouncedSearch, isSelected, resetSearch]);

    // Get selected users from cache
    const selectedUsers = useMemo(() => {
        if (selectedKeys === "all") return Array.from(usersCache.values());
        return Array.from(selectedKeys)
            .map((key) => usersCache.get(key as string))
            .filter((user): user is UserSearchResult => user !== undefined);
    }, [selectedKeys, usersCache]);

    const handleConfirm = useCallback(() => {
        onConfirm(selectedUsers);
        onOpenChange(false);
    }, [selectedUsers, onConfirm, onOpenChange]);

    const handleCancel = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setIsSelected(false);
    }, []);

    const handleSelectionChange = useCallback(
        (keys: Selection) => {
            setSelectedKeys(keys);
            if (selectionMode === "single" && keys !== "all" && keys.size > 0) {
                const selected = Array.from(keys)
                    .map((key) => usersCache.get(key as string))
                    .filter((user): user is UserSearchResult => user !== undefined);
                if (selected.length > 0) {
                    setSearchQuery(selected[0].displayName.trim());
                    setIsSelected(true);
                    confirmButtonRef.current?.focus();
                }
            }
        },
        [selectionMode, usersCache],
    );

    // UI states
    const showSearchHint = searchQuery.trim().length < minSearchLength;
    const showLoading = (searchState.isLoading || searchState.isFetching) && !showSearchHint;
    const showNoResults =
        !showLoading &&
        !showSearchHint &&
        !isSelected &&
        searchResults.length === 0 &&
        searchQuery.trim().length > 0;
    const showUsers = !showLoading && !showSearchHint && searchResults.length > 0 && !isSelected;
    const hasSelection = selectedKeys === "all" || selectedKeys.size > 0;

    const modalTitle = title ?? t("user_picker.title");
    const searchPlaceholderText = searchPlaceholder ?? t("user_picker.search_placeholder");

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{modalTitle}</Modal.Header>
            <Modal.Body>
                <SearchInput
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholderText}
                    autoFocus={isOpen}
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

                {/* User List */}
                {showUsers && (
                    <SearchListBox
                        autoFocus={false}
                        items={searchListBoxValues}
                        selectedKeys={selectedKeys}
                        onSelectionChange={handleSelectionChange}
                        selectionMode={selectionMode}
                        aria-label={modalTitle}
                    />
                )}

                {/* No results */}
                {showNoResults && (
                    <div className="py-8 text-center text-grey-600 dark:text-grey-400">
                        {t("user_picker.no_results")}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={!hasSelection}
                    ref={confirmButtonRef}
                >
                    {t("confirm")}
                </Button>
                <Button
                    intent="secondary"
                    leftIcon={<Icon name="user-add-line" className="text-inherit" />}
                >
                    {t("user_picker.not_in_list")}{" "}
                </Button>
                <Button
                    intent="secondary"
                    variant="destructive"
                    onClick={handleCancel}
                    className="ml-auto"
                >
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
