import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Button, Input, Modal, Text} from "@datanose/ui";

import {SearchAndSelect} from "~/components/instance/SearchAndSelect.tsx";
import {useManualUserEmailVerification} from "~/hooks/useManualUserEmailVerification.ts";
import {useMockLazyFindOrganizationsQuery} from "~/hooks/useMockLazyFindOrganizationsQuery.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

type Selection = "all" | Set<string | number>;

const MANUAL_EXTERNAL_USER_KEYS = {
    sourceKey: "repository",
    providerKey: "eduid",
} as const;

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
    ...MANUAL_EXTERNAL_USER_KEYS,
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
    const searchResults = useMemo(() => searchState.data ?? [], [searchState.data]);
    const {
        emailError,
        isVerifyingEmail,
        clearEmailValidation,
        resetEmailVerification,
        validateEmail,
        wasEmailVerified,
    } = useManualUserEmailVerification();

    const updateExternalUser = useCallback((updates: Partial<UserSearchResult>) => {
        setNewExternalUser((prev) => ({
            ...prev,
            ...updates,
        }));
    }, []);

    useEffect(() => {
        if (!prevIsOpen.current && isOpen) {
            setNewExternalUser(
                initialUser
                    ? {
                          ...initialUser,
                          ...MANUAL_EXTERNAL_USER_KEYS,
                          isExternal: true,
                      }
                    : emptyExternalUser,
            );
            setSelectedOrganization(
                initialUser?.organization ? new Set([initialUser.organization.id]) : new Set(),
            );
            resetEmailVerification();
        }
        prevIsOpen.current = isOpen;
    }, [initialUser, isOpen, resetEmailVerification]);

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
                (organization) => organization.key === selectedOrganizationId,
            );
            updateExternalUser({
                organization: foundOrganization
                    ? {id: foundOrganization.key, name: foundOrganization.primaryValue}
                    : undefined,
            });
        },
        [searchResults, updateExternalUser],
    );

    const normalizedEmail = newExternalUser.email.trim();
    const normalizedDisplayName = newExternalUser.displayName.trim();
    const hasOrganization = !!newExternalUser.organization?.name?.trim();
    const isCompleted = normalizedEmail !== "" && normalizedDisplayName !== "" && hasOrganization;

    const handleConfirm = useCallback(async () => {
        const isVerified =
            wasEmailVerified(normalizedEmail) || (await validateEmail(normalizedEmail));
        if (!isVerified) {
            return;
        }

        onConfirm({
            ...newExternalUser,
            displayName: normalizedDisplayName,
            email: normalizedEmail,
            userName: normalizedEmail,
            isExternal: true,
            ...MANUAL_EXTERNAL_USER_KEYS,
        });
        onOpenChange(false);
    }, [
        newExternalUser,
        normalizedDisplayName,
        normalizedEmail,
        onConfirm,
        onOpenChange,
        validateEmail,
        wasEmailVerified,
    ]);

    const handleBackToSearch = useCallback(() => {
        onOpenChange(false);
        onBackToSearch();
    }, [onOpenChange, onBackToSearch]);

    const handleEmailBlur = useCallback(async () => {
        if (normalizedEmail === "" || wasEmailVerified(normalizedEmail)) {
            return;
        }

        await validateEmail(normalizedEmail);
    }, [normalizedEmail, validateEmail, wasEmailVerified]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Header>{t("external_user_add.title")}</Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
                <Text>{t("external_user_add.description")}</Text>

                <Input
                    label={t("name")}
                    type="text"
                    value={newExternalUser.displayName}
                    onChange={(value: string) => updateExternalUser({displayName: value})}
                />
                <Input
                    label={t("email")}
                    type="email"
                    value={newExternalUser.email}
                    isValid={emailError == null}
                    errorMessage={emailError ?? undefined}
                    onChange={(value: string) => {
                        updateExternalUser({email: value});
                        clearEmailValidation();
                    }}
                    onBlur={() => {
                        void handleEmailBlur();
                    }}
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
                        value={newExternalUser.organization?.name ?? ""}
                        onChange={(value: string) =>
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
                    onClick={() => {
                        void handleConfirm();
                    }}
                    disabled={!isCompleted || isVerifyingEmail || emailError != null}
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
