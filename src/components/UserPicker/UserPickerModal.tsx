import {useCallback, useEffect, useMemo, useState} from "react";

import {Button, Icon, Input, Item, ListBox, LoadingSpinner, Modal, Separator} from "@datanose/ui";

import {useDebounce} from "../../hooks/useDebounce";
import {useTranslate} from "../../hooks/useTranslate";
import type {UserSearchResult} from "../../store/api/types/users";
import {useLazyFindUsersQuery} from "../../store/api/usersApi";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

    const [triggerSearch, {data: searchResults = [], isLoading, isFetching}] =
        useLazyFindUsersQuery();

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
        }
    }, [initialSelection, isOpen]);

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
        if (searchQuery.trim().length >= minSearchLength) {
            debouncedSearch(searchQuery);
        }
    }, [searchQuery, minSearchLength, debouncedSearch]);

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

    // UI states
    const showSearchHint = searchQuery.trim().length < minSearchLength;
    const showLoading = (isLoading || isFetching) && !showSearchHint;
    const showNoResults =
        !showLoading &&
        !showSearchHint &&
        searchResults.length === 0 &&
        searchQuery.trim().length > 0;
    const showUsers = !showLoading && !showSearchHint && searchResults.length > 0;
    const hasSelection = selectedKeys === "all" || selectedKeys.size > 0;

    const modalTitle = title ?? t("user_picker.title");
    const searchPlaceholderText = searchPlaceholder ?? t("user_picker.search_placeholder");

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{modalTitle}</Modal.Header>
            <Modal.Body>
                {/* Search Input */}
                <div className="relative mb-4">
                    <Input
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={searchPlaceholderText}
                        className="pr-12"
                    />
                    <div className="absolute top-0 right-0 flex h-full items-center">
                        <Separator orientation="vertical" className="w-px" />
                        <div className="px-3">
                            {showLoading ? (
                                <LoadingSpinner size="xs" />
                            ) : (
                                <Icon name="search-line" size="md" color="secondary" />
                            )}
                        </div>
                    </div>
                </div>

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
                    <ListBox
                        items={searchResults}
                        selectedKeys={selectedKeys}
                        onSelectionChange={setSelectedKeys}
                        selectionMode={selectionMode}
                        aria-label={modalTitle}
                    >
                        {(user) => (
                            <Item key={user.userName} textValue={user.displayName}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-black dark:text-white">
                                            {user.displayName}
                                        </span>
                                        {user.email && (
                                            <span className="truncate text-xs text-grey-500 dark:text-grey-500">
                                                {user.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Item>
                        )}
                    </ListBox>
                )}

                {/* No results */}
                {showNoResults && (
                    <div className="py-8 text-center text-grey-600 dark:text-grey-400">
                        {t("user_picker.no_results")}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button intent="secondary" onClick={handleCancel}>
                    {t("cancel")}
                </Button>
                <Button intent="primary" onClick={handleConfirm} disabled={!hasSelection}>
                    {t("confirm")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
