import {useCallback, useState} from "react";

import {Button, Modal} from "@uva-fnwi/datanose-ui";

import {EmailInput} from "~/components/inputs/EmailInput";
import {useManualUserEmailVerification} from "~/hooks/useManualUserEmailVerification.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

export type EditEmailModalProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSave: (user: UserSearchResult) => Promise<void> | void;
    user: UserSearchResult;
    isSaving?: boolean;
};

export function EditEmailModal({
    isOpen,
    setIsOpen,
    onSave,
    user,
    isSaving = false,
}: EditEmailModalProps) {
    const {t} = useTranslate("workflow");
    const [newEmail, setNewEmail] = useState(user.email);

    const {
        emailError,
        isVerifyingEmail,
        clearEmailValidation,
        setEmailValidationError,
        validateEmail,
        wasEmailVerified,
    } = useManualUserEmailVerification({
        internalEmail: t("staff_card.edit_email_modal.error_internal_email"),
        emailAlreadyExists: t("staff_card.edit_email_modal.error_email_already_exists"),
    });

    const isEmailVerified = wasEmailVerified(newEmail.trim());

    const handleEmailBlur = useCallback(async () => {
        const normalizedEmail = newEmail.trim();
        if (normalizedEmail === "" || wasEmailVerified(normalizedEmail)) {
            return;
        }
        await validateEmail(normalizedEmail);
    }, [newEmail, validateEmail, wasEmailVerified]);

    const handleEmailSave = useCallback(async () => {
        const normalizedEmail = newEmail.trim();

        // Validate if not already verified
        const isVerified =
            wasEmailVerified(normalizedEmail) || (await validateEmail(normalizedEmail));

        if (!isVerified) {
            return; // Don't save if validation fails
        }

        const newUser = {...user, email: normalizedEmail};
        try {
            await onSave(newUser);
        } catch (error) {
            setEmailValidationError(error);
            return;
        }
        setIsOpen(false);
    }, [
        newEmail,
        wasEmailVerified,
        validateEmail,
        user,
        onSave,
        setIsOpen,
        setEmailValidationError,
    ]);

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Modal.Header>
                {t("staff_card.edit_email_modal.title", {name: user.displayName})}
            </Modal.Header>
            <Modal.Body>
                <EmailInput
                    label={t("email")}
                    value={newEmail}
                    isValid={emailError == null}
                    errorMessage={emailError ?? undefined}
                    onChange={(value: string) => {
                        setNewEmail(value);
                        clearEmailValidation();
                    }}
                    onBlur={() => {
                        void handleEmailBlur();
                    }}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    intent="primary"
                    variant="destructive"
                    onClick={handleEmailSave}
                    disabled={
                        isVerifyingEmail ||
                        isSaving ||
                        emailError != null ||
                        !newEmail.trim() ||
                        !isEmailVerified
                    }
                >
                    {t("save")}
                </Button>
                <Button intent="secondary" variant="destructive" onClick={() => setIsOpen(false)}>
                    {t("cancel")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
