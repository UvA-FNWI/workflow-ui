import {useState} from "react";

export function useModalState<TInput>(
    onConfirm: (input: TInput) => Promise<void>,
    onSuccess?: () => void,
) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async (input: TInput) => {
        setIsLoading(true);
        try {
            await onConfirm(input);
            setIsOpen(false);
            onSuccess?.();
        } finally {
            setIsLoading(false);
        }
    };

    return {isOpen, setIsOpen, isLoading, handleConfirm};
}
