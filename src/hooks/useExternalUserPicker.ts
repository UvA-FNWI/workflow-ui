import {useState} from "react";

import type {CreateExternalUserInput} from "~/store/api/types/users.ts";

export function useExternalUserPicker(
    onCreateExternalUser: (newUser: CreateExternalUserInput) => Promise<void>,
    onSuccess?: () => void,
) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleConfirm = async (newUser: CreateExternalUserInput) => {
        setIsCreating(true);
        try {
            await onCreateExternalUser(newUser);
            setIsOpen(false);
            onSuccess?.();
        } finally {
            setIsCreating(false);
        }
    };

    return {isOpen, setIsOpen, isCreating, handleConfirm};
}
