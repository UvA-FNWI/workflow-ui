import {useState} from "react";

import {Callout, SearchInput} from "@datanose/ui";

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
}) => {
    const [isOpenUserPicker, setIsOpenUserPicker] = useState(false);
    const [isOpenExternal, setIsOpenExternal] = useState(false);
    const [showCallout, setShowCallout] = useState(false);
    const {t} = useTranslate("workflow");

    // Normalize value prop to array
    const valueArray = value ? (Array.isArray(value) ? value : [value]) : [];

    // Get display value
    const displayValue = (() => {
        if (valueArray.length === 0) return "";
        if (valueArray.length === 1) return valueArray[0].displayName.trim();
        return t("user_picker.selected_users", {count: valueArray.length});
    })();

    const handleOpenUserPickerModal = () => !isDisabled && setIsOpenUserPicker(true);

    const handleOpenExternalUserModal = () => !isDisabled && setIsOpenExternal(true);

    const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        handleOpenUserPickerModal();
    };

    const handleConfirmUserPicker = (selectedUsers: UserSearchResult[]) =>
        onChange?.(selectionMode === "single" ? selectedUsers[0] || null : selectedUsers);

    const handleConfirmExternalUser = (newUser: UserSearchResult) => {
        console.log("New external user added:");
        console.log(JSON.stringify(newUser, null, 2));

        setIsOpenExternal(false);
        setIsOpenUserPicker(false);
        onChange?.(null);
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
                initialSelection={valueArray}
                onConfirm={handleConfirmUserPicker}
                onAddExternalUser={handleOpenExternalUserModal}
                selectionMode={selectionMode}
                title={modalTitle}
                searchPlaceholder={searchPlaceholder}
                minSearchLength={minSearchLength}
            />

            <AddExternalUserModal
                isOpen={isOpenExternal}
                onOpenChange={setIsOpenExternal}
                onConfirm={handleConfirmExternalUser}
            />
        </>
    );
};
