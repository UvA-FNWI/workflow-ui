import {useState} from "react";

import {SearchInput} from "@datanose/ui";

import {UserPickerModal} from "./UserPickerModal";
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
    const [isOpen, setIsOpen] = useState(false);
    const {t} = useTranslate("workflow", {keyPrefix: "user_picker"});

    // Normalize value prop to array
    const valueArray = value ? (Array.isArray(value) ? value : [value]) : [];

    // Get display value
    const displayValue = (() => {
        if (valueArray.length === 0) return "";
        if (valueArray.length === 1) return valueArray[0].displayName;
        return t("selected_users", {count: valueArray.length});
    })();

    const handleOpenModal = () => !isDisabled && setIsOpen(true);

    const handleConfirm = (selectedUsers: UserSearchResult[]) =>
        onChange?.(selectionMode === "single" ? selectedUsers[0] || null : selectedUsers);

    return (
        <>
            <SearchInput
                label={label}
                placeholder={placeholder}
                value={displayValue}
                onClick={handleOpenModal}
                isDisabled={isDisabled}
                readOnly={true}
            />

            <UserPickerModal
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                initialSelection={valueArray}
                onConfirm={handleConfirm}
                selectionMode={selectionMode}
                title={modalTitle}
                searchPlaceholder={searchPlaceholder}
                minSearchLength={minSearchLength}
            />
        </>
    );
};
