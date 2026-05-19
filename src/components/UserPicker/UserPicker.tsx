import {useState} from "react";

import {Callout, SearchInput} from "@uva-fnwi/datanose-ui";

import {UserPickerModal} from "./UserPickerModal";
import {AddExternalUserModal} from "~/components/instance/AddExternalUserModal.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {UserSearchResult} from "~/store/api/types/users.ts";

export interface UserPickerProps {
    /** Optional label for the input */
    label?: string;
    /** Placeholder text for the input trigger */
    placeholder?: string;
    /** Current selection - single user or array of users */
    value?: UserSearchResult | UserSearchResult[] | null;
    /** Callback when selection changes - returns selected user data */
    onChange?: (users: UserSearchResult | UserSearchResult[] | null) => void;
    /** Selection mode: 'single' for single selection, 'multiple' for multi-selection */
    selectionMode?: "single" | "multiple";
    /** Whether the picker is disabled */
    isDisabled?: boolean;
    /** Modal title */
    modalTitle?: string;
    /** Search placeholder in modal */
    searchPlaceholder?: string;
    /** Minimum search length before triggering API call */
    minSearchLength?: number;
    /** Whether to allow adding external users */
    allowsExternalUsers?: boolean;
}

export const UserPicker: React.FC<UserPickerProps> = ({
    label,
    placeholder,
    value,
    onChange,
    selectionMode = "single",
    isDisabled = false,
    modalTitle,
    searchPlaceholder,
    minSearchLength,
    allowsExternalUsers = false,
}) => {
    const [isOpenUserPicker, setIsOpenUserPicker] = useState(false);
    const [isOpenExternal, setIsOpenExternal] = useState(false);
    const [showCallout, setShowCallout] = useState(false);
    const {t} = useTranslate("workflow");

    // Normalize value prop to array
    const valueArray = value ? (Array.isArray(value) ? value : [value]) : [];

    const getDisplayString = (user: UserSearchResult) =>
        user.isExternal
            ? `${user.displayName.trim()} | ${user.email.trim()} ${user.organization ? ` | ${user.organization?.name.trim()}` : ""}`
            : user.displayName.trim();

    // Get display value
    const displayValue = (() => {
        if (valueArray.length === 0) return "";
        if (valueArray.length === 1) return getDisplayString(valueArray[0]);
        return t("user_picker.selected_users", {count: valueArray.length});
    })();

    const handleOpenUserPickerModal = () => {
        if (!isDisabled) {
            if (valueArray.length === 1 && valueArray[0].organization) setIsOpenExternal(true);
            else setIsOpenUserPicker(true);
        }
    };

    const handleOpenExternalUserModal = () => {
        if (!isDisabled) {
            setIsOpenExternal(true);
            setIsOpenUserPicker(false);
        }
    };

    const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        handleOpenUserPickerModal();
    };

    const handleConfirmUserPicker = (selectedUsers: UserSearchResult[]) => {
        onChange?.(selectionMode === "single" ? selectedUsers[0] || null : selectedUsers);
    };

    const handleConfirmExternalUser = (newUser: UserSearchResult) => {
        const id = new Date().toISOString().replace(/[-:.TZ]/g, "");
        newUser.userName = `${newUser.displayName.replace(/\s/g, "-").toLowerCase()}_${id}`;

        setIsOpenExternal(false);
        setIsOpenUserPicker(false);
        onChange?.(newUser);
        setShowCallout(true);
    };

    return (
        <>
            <SearchInput
                label={label}
                placeholder={placeholder}
                value={displayValue}
                onClick={handleOpenUserPickerModal}
                onKeyDown={handleSearchInputKeyDown}
                isDisabled={isDisabled}
                readOnly={true}
                role="button"
                className="cursor-pointer"
            />
            {showCallout && (
                <Callout className="mt-1" header={t("external_user_add.success_toast")} />
            )}

            <UserPickerModal
                isOpen={isOpenUserPicker}
                onOpenChange={setIsOpenUserPicker}
                initialSelection={
                    valueArray.length === 1 && valueArray[0].isExternal ? undefined : valueArray
                }
                onConfirm={handleConfirmUserPicker}
                onAddExternalUser={handleOpenExternalUserModal}
                selectionMode={selectionMode}
                title={modalTitle}
                searchPlaceholder={searchPlaceholder}
                minSearchLength={minSearchLength}
                allowsExternalUsers={allowsExternalUsers}
            />

            <AddExternalUserModal
                isOpen={isOpenExternal}
                onOpenChange={setIsOpenExternal}
                onConfirm={handleConfirmExternalUser}
                onBackToSearch={() => setIsOpenUserPicker(true)}
                initialUser={
                    valueArray.length === 1 && valueArray[0].isExternal ? valueArray[0] : undefined
                }
            />
        </>
    );
};
