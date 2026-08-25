import {useEffect, useMemo, useRef, useState} from "react";

import {Trans} from "react-i18next";

import {
    Button,
    Callout,
    Icon,
    InputLabel,
    Modal,
    Select,
    SelectItem,
    Text,
} from "@uva-fnwi/datanose-ui";

import {AddExternalUserModal} from "~/components/instance/AddExternalUserModal.tsx";
import {UserPickerInput} from "~/components/UserPicker/UserPickerInput.tsx";
import {useModalState} from "~/hooks/useModalState.ts";
import {type LocalString, useTranslate} from "~/hooks/useTranslate.ts";
import type {RelatedUserGroup, Role} from "~/store/api/types/instances.ts";
import type {CreateExternalUserInput, UserSearchResult} from "~/store/api/types/users.ts";

export interface AddStaffModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onConfirm: (
        role: Role,
        value: UserSearchResult[],
        externalUser: CreateExternalUserInput | null,
    ) => void;
    isSaving?: boolean;
    allowsExternalUsers?: boolean;
    instanceRoles: Role[];
    initialRole?: Role;
    disableRoleSelection?: boolean;
    relatedUserGroups?: RelatedUserGroup[];
}

export default function AddStaffModal({
    isOpen,
    onOpenChange,
    onConfirm,
    isSaving,
    allowsExternalUsers,
    instanceRoles,
    initialRole,
    disableRoleSelection,
    relatedUserGroups,
}: AddStaffModalProps) {
    const {l, t} = useTranslate("workflow");
    const [selectedRole, setSelectedRole] = useState<Role | null>(initialRole ?? null);
    const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
    const [externalUser, setExternalUser] = useState<CreateExternalUserInput | null>(null);
    const prevIsOpen = useRef(false);

    useEffect(() => {
        if (!prevIsOpen.current && isOpen) {
            setSelectedRole(initialRole ?? null);
        }
    }, [isOpen, initialRole]);

    const {isReplacing, currentName, currentRole} = useMemo(() => {
        if (!selectedRole || !relatedUserGroups)
            return {
                isReplacing: false,
                currentName: "",
                currentRole: {en: "", nl: ""} as LocalString,
            };
        const matchedRole = relatedUserGroups
            .flatMap((ug) => ug.userRoles)
            .find((r) => r.role === selectedRole.name);
        return {
            isReplacing:
                !!matchedRole && !matchedRole.allowsMultipleUsers && matchedRole.users.length >= 1,
            currentName: matchedRole?.users[0]?.displayName ?? "",
            currentRole: matchedRole?.title ?? ({en: "", nl: ""} as LocalString),
        };
    }, [selectedRole, relatedUserGroups]);

    const handleCreateExternalUser = async (newUser: CreateExternalUserInput): Promise<void> => {
        setExternalUser(newUser);
        const externalUserResult: UserSearchResult = {
            displayName: newUser.displayName,
            userName: newUser.email,
            email: newUser.email,
            organization: newUser.organization,
            isExternal: true,
            isPending: false,
        };
        setSelectedUsers([externalUserResult]);
    };

    const {
        isOpen: isOpenExternal,
        setIsOpen: setIsOpenExternal,
        isLoading: isCreatingExternalUser,
        handleConfirm: handleConfirmExternalUser,
    } = useModalState<CreateExternalUserInput>(handleCreateExternalUser);

    const isComplete = selectedRole != null && selectedUsers != null;

    const handleClose = () => {
        onOpenChange(false);
        setSelectedUsers([]);
        setSelectedRole(null);
        setExternalUser(null);
    };
    const handleConfirm = () => {
        if (!selectedRole || !selectedUsers) return;
        onConfirm(selectedRole, selectedUsers, externalUser);
        handleClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <Modal.Header>{t("staff_card.add_modal.title")}</Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                    <Text>{t("staff_card.add_modal.description")}</Text>

                    <div>
                        <InputLabel>{t("staff_card.add_modal.choose_role")}</InputLabel>
                        <Select
                            placeholder={t("make_a_choice")}
                            value={selectedRole?.name}
                            onChange={(value) =>
                                setSelectedRole(
                                    instanceRoles?.find((role) => role.name === value) ?? null,
                                )
                            }
                            isDisabled={disableRoleSelection}
                        >
                            {instanceRoles?.map((role) => (
                                <SelectItem key={role.name} title={l(role.title)}>
                                    {l(role.title)}
                                </SelectItem>
                            )) ?? []}
                        </Select>
                    </div>
                    <div>
                        <InputLabel>{t("staff_card.add_modal.choose_staff")}</InputLabel>
                        <UserPickerInput
                            key={selectedUsers.map((u) => u.email).join(",")}
                            initialSelection={selectedUsers}
                            onSelectionChange={setSelectedUsers}
                            searchPlaceholder={t("make_a_choice")}
                            autoFocus={false}
                            allowsExternalUsers={allowsExternalUsers}
                            showSelectedEmail={true}
                        />
                    </div>
                    <Callout header={t("staff_card.add_modal.info_callout_header")}>
                        {t("staff_card.add_modal.info_callout_text")}
                    </Callout>
                    {isReplacing && (
                        <Callout type="warning">
                            <Trans
                                i18nKey="workflow:staff_card.add_modal.warning_callout_text"
                                values={{
                                    role: currentRole ? l(currentRole) : "",
                                    name: currentName,
                                }}
                            />
                        </Callout>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex flex-row gap-2">
                        <Button
                            size="large"
                            intent="primary"
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={!isComplete}
                            isLoading={isSaving}
                        >
                            {t("confirm")}
                        </Button>
                        {allowsExternalUsers && (
                            <Button
                                size="large"
                                intent="secondary"
                                onClick={() => setIsOpenExternal(true)}
                                leftIcon={<Icon name="user-add-line" color="current" />}
                            >
                                {t("user_picker.not_in_list")}
                            </Button>
                        )}
                        <Button
                            size="large"
                            intent="secondary"
                            variant="destructive"
                            onClick={handleClose}
                            className="ml-auto"
                        >
                            {t("cancel")}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            <AddExternalUserModal
                isOpen={isOpenExternal}
                onOpenChange={setIsOpenExternal}
                onConfirm={handleConfirmExternalUser}
                isSaving={isCreatingExternalUser}
                onBackToSearch={() => setIsOpenExternal(false)}
                emailErrorMessages={{
                    internalEmail: t("staff_card.edit_email_modal.error_internal_email"),
                    emailAlreadyExists: t("staff_card.edit_email_modal.error_email_already_exists"),
                }}
            />
        </>
    );
}
