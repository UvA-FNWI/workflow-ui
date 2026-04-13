import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Button, Icon, Modal} from "@datanose/ui";

import {SearchAndSelect} from "~/components/instance/SearchAndSelect.tsx";
import {type SearchListBoxValue} from "~/components/instance/SearchListBox.tsx";
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
    onAddExternalUser?: () => void;
    selectionMode?: "single" | "multiple";
    title?: string;
    searchPlaceholder?: string;
    minSearchLength?: number;
    allowsExternalUsers?: boolean;
}

export const UserPickerModal: React.FC<UserPickerModalProps> = ({
    isOpen,
    onOpenChange,
    initialSelection = [],
    onConfirm,
    onAddExternalUser,
    selectionMode = "single",
    title,
    searchPlaceholder,
    minSearchLength,
    allowsExternalUsers,
}) => {
    const {t} = useTranslate("workflow");
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

    const [triggerSearch, searchState] = useLazyFindUsersQuery();
    const resetSearch = searchState.reset;
    const searchResults = useMemo(() => searchState.data ?? [], [searchState]);

    const searchListBoxValues: SearchListBoxValue[] = useMemo(() => {
        return searchResults.map((user) => ({
            key: user.userName,
            primaryValue: user.displayName,
            secondaryValue: user.institute ?? user.email,
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
            resetSearch();
        }
    }, [initialSelection, isOpen, resetSearch]);

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

    const handleSelectionChange = useCallback(
        (keys: Selection) => {
            setSelectedKeys(keys);
            if (selectionMode === "single" && keys !== "all" && keys.size > 0) {
                const selected = Array.from(keys)
                    .map((key) => usersCache.get(key as string))
                    .filter((user): user is UserSearchResult => user !== undefined);
                if (selected.length > 0) {
                    confirmButtonRef.current?.focus();
                }
            }
        },
        [selectionMode, usersCache],
    );

    // UI states
    const hasSelection = selectedKeys === "all" || selectedKeys.size > 0;

    const modalTitle = title ?? t("user_picker.title");
    const searchPlaceholderText = searchPlaceholder ?? t("user_picker.search_placeholder");

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{modalTitle}</Modal.Header>
            <Modal.Body>
                <SearchAndSelect
                    items={searchListBoxValues}
                    selectedKeys={selectedKeys}
                    onSelect={handleSelectionChange}
                    onSearch={triggerSearch}
                    resetSearch={resetSearch}
                    placeholder={searchPlaceholderText}
                    autoFocus={isOpen}
                    selectionMode={selectionMode}
                    minSearchLength={minSearchLength}
                    isLoading={searchState.isLoading || searchState.isFetching}
                    noResultsText={t("user_picker.no_results")}
                    searchHintText={
                        selectionMode == "single"
                            ? t("user_picker.search_hint_one")
                            : t("user_picker.search_hint_other")
                    }
                />
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
                {allowsExternalUsers && (
                    <Button
                        intent="secondary"
                        onClick={onAddExternalUser}
                        leftIcon={<Icon name="user-add-line" className="text-inherit" />}
                    >
                        {t("user_picker.not_in_list")}
                    </Button>
                )}
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
