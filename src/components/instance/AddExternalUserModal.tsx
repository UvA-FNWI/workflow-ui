import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Button, Input, Modal, Text} from "@datanose/ui";

import {SearchAndSelect} from "~/components/instance/SearchAndSelect.tsx";
import {useMockLazyFindOrganizationsQuery} from "~/hooks/useMockLazyFindOrganizationsQuery.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

export interface AddExternalUserModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onConfirm: (newUser: UserSearchResult) => void;
    onBackToSearch: () => void;
    initialUser?: UserSearchResult | null;
}

const emptyExternalUser: UserSearchResult = {
    displayName: "",
    userName: "",
    email: "",
    organization: undefined,
    isExternal: true,
};

export const AddExternalUserModal: React.FC<AddExternalUserModalProps> = ({
    isOpen,
    onOpenChange,
    onConfirm,
    onBackToSearch,
    initialUser,
}) => {
    const {t} = useTranslate("workflow");
    const prevIsOpen = useRef(false);
    const [selectedOrganization, setSelectedOrganization] = useState<Selection>(
        initialUser?.organization ? new Set([initialUser.organization.id]) : new Set(),
    );
    const [newExternalUser, setNewExternalUser] = useState<UserSearchResult>(
        initialUser ?? emptyExternalUser,
    );

    const [triggerSearch, searchState, resetSearch] = useMockLazyFindOrganizationsQuery();
    const searchResults = useMemo(() => searchState.data ?? [], [searchState]);

    const updateExternalUser = useCallback((updates: Partial<UserSearchResult>) => {
        setNewExternalUser((prev) => ({
            ...prev,
            ...updates,
        }));
    }, []);

    useEffect(() => {
        if (!prevIsOpen.current && isOpen) {
            setNewExternalUser(initialUser ?? emptyExternalUser);
            setSelectedOrganization(
                initialUser?.organization ? new Set([initialUser.organization.id]) : new Set(),
            );
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, initialUser]);

    const handleConfirm = useCallback(() => {
        onConfirm({...newExternalUser, isExternal: true});
        onOpenChange(false);
    }, [onConfirm, onOpenChange, newExternalUser]);

    const handleBackToSearch = useCallback(() => {
        onOpenChange(false);
        onBackToSearch();
    }, [onOpenChange, onBackToSearch]);

    const handleSelectOrganizationChange = useCallback(
        (selected: Selection) => {
            setSelectedOrganization(selected);
            if (selected === "all" || selected.size === 0) return;
            const selectedOrganizationId = [...selected][0] as string;

            if (selectedOrganizationId === "new-item") {
                updateExternalUser({organization: undefined});
                return;
            }

            const foundOrganization = searchResults.find(
                (inst) => inst.key === selectedOrganizationId,
            );
            updateExternalUser({
                organization: foundOrganization
                    ? {id: foundOrganization.key, name: foundOrganization.primaryValue}
                    : undefined,
            });
        },
        [searchResults, updateExternalUser],
    );

    const isValidEmail =
        newExternalUser.email != "" &&
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newExternalUser.email);
    const isCompleted =
        isValidEmail && !!newExternalUser.displayName && !!newExternalUser.organization;

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{t("external_user_add.title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                <Text>{t("external_user_add.description")}</Text>

                <Input
                    label={t("name")}
                    type="text"
                    value={newExternalUser.displayName}
                    onChange={(value) => updateExternalUser({displayName: value})}
                />
                <Input
                    label={t("email")}
                    type="email"
                    value={newExternalUser.email}
                    isValid={newExternalUser.email === "" || isValidEmail}
                    errorMessage={t("external_user_add.email_error")}
                    onChange={(value) => updateExternalUser({email: value})}
                />

                <SearchAndSelect
                    label={t("external_user_add.organization")}
                    items={searchResults}
                    selectedKeys={selectedOrganization}
                    onSelect={handleSelectOrganizationChange}
                    onSearch={triggerSearch}
                    resetSearch={resetSearch}
                    isLoading={searchState.isLoading || searchState.isFetching}
                    addNewItemVisible={true}
                    showSearchHint={false}
                    initialSearchQuery={
                        initialUser?.organization?.id === "new-item"
                            ? t("search_and_select.add_new")
                            : (initialUser?.organization?.name ?? "")
                    }
                />

                {selectedOrganization instanceof Set && selectedOrganization.has("new-item") && (
                    <Input
                        label={t("external_user_add.organization_name")}
                        type="text"
                        value={newExternalUser.organization?.name}
                        onChange={(value) =>
                            updateExternalUser({
                                organization: {
                                    id: "new-item",
                                    name: value,
                                },
                            })
                        }
                    />
                )}
            </Modal.Body>
            <Modal.Footer className="justify-start">
                <Button
                    intent="primary"
                    variant="destructive"
                    onClick={handleConfirm}
                    disabled={!isCompleted}
                >
                    {t("confirm")}
                </Button>
                <Button intent="secondary" variant="destructive" onClick={handleBackToSearch}>
                    {t("external_user_add.back_to_search")}
                </Button>
                <Button
                    intent="secondary"
                    variant="destructive"
                    onClick={() => onOpenChange(false)}
                >
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
