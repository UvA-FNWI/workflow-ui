import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Button, Input, Modal, Text} from "@uva-fnwi/datanose-ui";

import type {SearchListBoxValue} from "./SearchListBox";
import {EmailInput} from "~/components/inputs/EmailInput";
import {SearchAndSelect} from "~/components/instance/SearchAndSelect.tsx";
import {
    type EmailErrorMessages,
    useManualUserEmailVerification,
} from "~/hooks/useManualUserEmailVerification.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import {
    useCreateOrganizationMutation,
    useLazyFindOrganizationsQuery,
} from "~/store/api/organizationsApi";
import type {CreateExternalUserInput, UserSearchResult} from "~/store/api/types/users.ts";

const newOrganizationId = "new-item";

type Selection = "all" | Set<string | number>;

export interface AddExternalUserModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onConfirm: (newUser: CreateExternalUserInput) => Promise<void>;
    onBackToSearch: () => void;
    isSaving?: boolean;
    initialUser?: UserSearchResult | null;
    emailErrorMessages?: EmailErrorMessages;
}

const emptyExternalUser: UserSearchResult = {
    displayName: "",
    userName: "",
    email: "",
    organization: undefined,
    isExternal: true,
    isPending: false,
};

export const AddExternalUserModal: React.FC<AddExternalUserModalProps> = ({
    isOpen,
    onOpenChange,
    onConfirm,
    onBackToSearch,
    isSaving = false,
    initialUser,
    emailErrorMessages,
}) => {
    const {t} = useTranslate("workflow");
    const prevIsOpen = useRef(false);
    const [selectedOrganization, setSelectedOrganization] = useState<Selection>(
        initialUser?.organization ? new Set([initialUser.organization.id]) : new Set(),
    );
    const [newExternalUser, setNewExternalUser] = useState<UserSearchResult>(
        initialUser ?? emptyExternalUser,
    );
    const [triggerSearch, searchState] = useLazyFindOrganizationsQuery();
    const resetSearch = searchState.reset;
    const searchResults = useMemo(() => searchState.data ?? [], [searchState.data]);
    const {
        emailError,
        isVerifyingEmail,
        clearEmailValidation,
        resetEmailVerification,
        setEmailValidationError,
        validateEmail,
        wasEmailVerified,
    } = useManualUserEmailVerification(emailErrorMessages ?? {});

    const searchListBoxValues: SearchListBoxValue[] = useMemo(() => {
        return searchResults.map((organization) => ({
            key: organization.id,
            primaryValue: organization.name,
        }));
    }, [searchResults]);

    const updateExternalUser = useCallback((updates: Partial<UserSearchResult>) => {
        setNewExternalUser((prev) => ({
            ...prev,
            ...updates,
        }));
    }, []);

    const [createOrganization, {isLoading: isCreatingOrganization}] =
        useCreateOrganizationMutation();

    useEffect(() => {
        if (!prevIsOpen.current && isOpen) {
            setNewExternalUser(
                initialUser
                    ? {
                          ...initialUser,
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
        (selected: Selection, searchQuery: string) => {
            setSelectedOrganization(selected);
            if (selected === "all" || selected.size === 0) return;
            const selectedOrganizationId = [...selected][0] as string;

            if (selectedOrganizationId === newOrganizationId) {
                updateExternalUser({organization: {id: newOrganizationId, name: searchQuery}});
                return;
            }

            const foundOrganization = searchResults.find(
                (organization) => organization.id === selectedOrganizationId,
            );

            updateExternalUser({
                organization: foundOrganization
                    ? {id: foundOrganization.id, name: foundOrganization.name}
                    : undefined,
            });
        },
        [searchResults, updateExternalUser],
    );

    const normalizedEmail = newExternalUser.email.trim();
    const normalizedDisplayName = newExternalUser.displayName.trim();
    const hasOrganization = !!newExternalUser.organization?.name?.trim();
    const isCompleted = normalizedEmail !== "" && normalizedDisplayName !== "" && hasOrganization;
    const isEmailVerified = wasEmailVerified(normalizedEmail);

    const handleConfirm = useCallback(async () => {
        const isVerified =
            wasEmailVerified(normalizedEmail) || (await validateEmail(normalizedEmail));
        if (!isVerified) {
            return;
        }

        let externalOrganization = newExternalUser.organization;

        if (hasOrganization && newExternalUser.organization?.id === newOrganizationId) {
            const res = await createOrganization({name: newExternalUser.organization.name});
            if (res.error) {
                alert(`Error: ${JSON.stringify(res.error)}`);
                return;
            }

            externalOrganization = res.data;
        }

        try {
            await onConfirm({
                displayName: normalizedDisplayName,
                email: normalizedEmail,
                organization: externalOrganization,
            });
        } catch (error) {
            setEmailValidationError(error);
        }
    }, [
        newExternalUser.organization,
        normalizedDisplayName,
        normalizedEmail,
        hasOrganization,
        onConfirm,
        setEmailValidationError,
        validateEmail,
        wasEmailVerified,
        createOrganization,
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

                <EmailInput
                    label={t("email")}
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
                    items={searchListBoxValues}
                    selectedKeys={selectedOrganization}
                    onSelect={handleSelectOrganizationChange}
                    onSearch={triggerSearch}
                    resetSearch={resetSearch}
                    isLoading={searchState.isLoading || searchState.isFetching}
                    addNewItemVisible={true}
                    initialSearchQuery={
                        initialUser?.organization?.id === newOrganizationId
                            ? t("search_and_select.add_new")
                            : (initialUser?.organization?.name ?? "")
                    }
                />

                {selectedOrganization instanceof Set &&
                    selectedOrganization.has(newOrganizationId) && (
                        <Input
                            label={t("external_user_add.organization_name")}
                            type="text"
                            value={newExternalUser.organization?.name}
                            onChange={(value) =>
                                updateExternalUser({
                                    organization: {
                                        id: newOrganizationId,
                                        name: value,
                                    },
                                })
                            }
                        />
                    )}
            </Modal.Body>
            <Modal.Footer className="justify-start">
                <Button
                    size="large"
                    intent="primary"
                    variant="destructive"
                    onClick={() => {
                        void handleConfirm();
                    }}
                    disabled={
                        !isCompleted ||
                        !isEmailVerified ||
                        isVerifyingEmail ||
                        isCreatingOrganization ||
                        isSaving
                    }
                >
                    {t("confirm")}
                </Button>
                <Button
                    size="large"
                    intent="secondary"
                    variant="destructive"
                    onClick={handleBackToSearch}
                >
                    {t("external_user_add.back_to_search")}
                </Button>
                <Button
                    size="large"
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
