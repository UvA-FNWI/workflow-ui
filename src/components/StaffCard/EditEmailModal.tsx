import {useCallback, useEffect, useState} from "react";

import {Button, Input, Modal} from "@uva-fnwi/datanose-ui";

import {useManualUserEmailVerification} from "~/hooks/useManualUserEmailVerification.ts";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {UserSearchResult} from "~/store/api/types/users.ts";

export type EditEmailModalProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSave: (user: UserSearchResult) => void;
    user: UserSearchResult;
};

export function EditEmailModal({isOpen, setIsOpen, onSave, user}: EditEmailModalProps) {
    const {t} = useTranslate("workflow");
    const [newEmail, setNewEmail] = useState(user.email);

    const {
        emailError,
        isVerifyingEmail,
        clearEmailValidation,
        resetEmailVerification,
        setEmailValidationError,
        validateEmail,
        wasEmailVerified,
    } = useManualUserEmailVerification();

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
            console.log(newUser);
        } catch (error) {
            setEmailValidationError(error);
            return;
        }
        onSave(newUser);
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

    useEffect(() => {
        if (isOpen) {
            resetEmailVerification();
        }
    }, [isOpen, resetEmailVerification]);

    return (
        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <Modal.Header>
                {t("staff_card.edit_email_title", {name: user.displayName})}
            </Modal.Header>
            <Modal.Body>
                <Input
                    label={t("email")}
                    type="email"
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
                <Button intent="secondary" variant="destructive" onClick={() => setIsOpen(false)}>
                    {t("cancel")}
                </Button>
                <Button
                    intent="primary"
                    variant="destructive"
                    onClick={handleEmailSave}
                    disabled={
                        isVerifyingEmail ||
                        emailError != null ||
                        !newEmail.trim() ||
                        !isEmailVerified
                    }
                >
                    {t("save")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
