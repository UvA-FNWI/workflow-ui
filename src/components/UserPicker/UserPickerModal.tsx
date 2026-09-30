import {useCallback, useRef, useState} from "react";

import {Button, Icon, Modal} from "@uva-fnwi/datanose-ui";

import {UserPickerInput} from "~/components/UserPicker/UserPickerInput.tsx";
import {useTranslate} from "~/hooks/useTranslate";
import type {UserSearchResult} from "~/store/api/types/users";

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
    const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>(initialSelection);

    const handleConfirm = useCallback(() => {
        onConfirm(selectedUsers);
        onOpenChange(false);
    }, [selectedUsers, onConfirm, onOpenChange]);

    const handleCancel = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    // UI states
    const hasSelection = selectedUsers.length > 0;

    const modalTitle = title ?? t("user_picker.title");

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <Modal.Header>{modalTitle}</Modal.Header>
            <Modal.Body>
                <UserPickerInput
                    initialSelection={initialSelection}
                    onSelectionChange={setSelectedUsers}
                    searchPlaceholder={searchPlaceholder}
                    showSearchHint={true}
                    selectionMode={selectionMode}
                    minSearchLength={minSearchLength}
                    autoFocus={isOpen}
                    allowsExternalUsers={allowsExternalUsers}
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
                        leftIcon={<Icon name="user-add-line" color="current" />}
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
