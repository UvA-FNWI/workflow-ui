import {useCallback, useState} from "react";

import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";

import {useTranslate} from "~/hooks/useTranslate.ts";
import {useVerifyEmailMutation} from "~/store/api/usersApi.ts";

type ManualUserEmailErrorCode =
    | "ManualUserInternalEmail"
    | "ManualUserEmailAlreadyExists"
    | "InvalidEmailAddress";

type VerifyEmailErrorResponse = {
    errorCode?: ManualUserEmailErrorCode;
};

const getApiErrorCode = (error: unknown): ManualUserEmailErrorCode | undefined =>
    ((error as FetchBaseQueryError | undefined)?.data as VerifyEmailErrorResponse | undefined)
        ?.errorCode;

export function useManualUserEmailVerification() {
    const {t} = useTranslate("workflow");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
    const [verifyEmail, verifyEmailState] = useVerifyEmailMutation();

    const getEmailErrorMessage = useCallback(
        (code?: ManualUserEmailErrorCode) => {
            switch (code) {
                case "ManualUserInternalEmail":
                    return t("external_user_add.manual_user_internal_email");
                case "ManualUserEmailAlreadyExists":
                    return t("external_user_add.manual_user_email_already_exists");
                case "InvalidEmailAddress":
                    return t("external_user_add.email_error");
                default:
                    return t("external_user_add.email_error");
            }
        },
        [t],
    );

    const validateEmail = useCallback(
        async (email: string) => {
            try {
                await verifyEmail({email}).unwrap();
                setEmailError(null);
                setVerifiedEmail(email);
                return true;
            } catch (error) {
                setVerifiedEmail(null);
                setEmailError(getEmailErrorMessage(getApiErrorCode(error)));
                return false;
            }
        },
        [getEmailErrorMessage, verifyEmail],
    );

    const clearEmailValidation = useCallback(() => {
        setEmailError(null);
        setVerifiedEmail(null);
    }, []);

    const setEmailValidationError = useCallback(
        (error: unknown) => {
            setVerifiedEmail(null);
            setEmailError(getEmailErrorMessage(getApiErrorCode(error)));
        },
        [getEmailErrorMessage],
    );

    const {reset: resetVerifyMutation, isLoading: isVerifyingEmail} = verifyEmailState;

    const resetEmailVerification = useCallback(() => {
        clearEmailValidation();
        resetVerifyMutation();
    }, [clearEmailValidation, resetVerifyMutation]);

    const wasEmailVerified = useCallback(
        (email: string) => verifiedEmail === email,
        [verifiedEmail],
    );

    return {
        emailError,
        isVerifyingEmail,
        clearEmailValidation,
        resetEmailVerification,
        setEmailValidationError,
        validateEmail,
        wasEmailVerified,
    };
}
