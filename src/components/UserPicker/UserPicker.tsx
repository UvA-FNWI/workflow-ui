import {useState} from "react";

import type {UserSearchResult} from "../../store/api/types/users";
import {UserPickerModal} from "./UserPickerModal";
import {UserPickerTrigger} from "./UserPickerTrigger";
import {useTranslate} from "~/hooks/useTranslate";

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

    // Get display value
    const displayValue = (() => {
        if (!value) {
            return "";
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return "";
            }
            if (value.length === 1) {
                return value[0].displayName;
            }
            return t("selected_users", {count: value.length});
        }

        return value.displayName;
    })();

    // Get initial selection
    const initialSelection = (() => {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return [value];
    })();

    const handleOpenModal = () => {
        if (!isDisabled) {
            setIsOpen(true);
        }
    };

    const handleConfirm = (selectedUsers: UserSearchResult[]) => {
        if (selectionMode === "single") {
            onChange?.(selectedUsers[0] || null);
        } else {
            onChange?.(selectedUsers);
        }
    };

    return (
        <>
            <UserPickerTrigger
                label={label}
                placeholder={placeholder}
                value={displayValue}
                onClick={handleOpenModal}
                isDisabled={isDisabled}
            />

            <UserPickerModal
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                initialSelection={initialSelection}
                onConfirm={handleConfirm}
                selectionMode={selectionMode}
                title={modalTitle}
                searchPlaceholder={searchPlaceholder}
                minSearchLength={minSearchLength}
            />
        </>
    );
};
