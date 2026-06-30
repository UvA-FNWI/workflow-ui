import {useState} from "react";

import {Input, type InputProps} from "@uva-fnwi/datanose-ui";

export interface ValidatedTextInputProps extends Omit<InputProps, "isValid" | "errorMessage"> {
    validate: (value: string) => boolean;
    validationMessage: string;
    // External (e.g. backend) validity, which takes precedence over the local check.
    isValid?: boolean;
    errorMessage?: string;
}

export const ValidatedTextInput = ({
    value = "",
    validate,
    validationMessage,
    isValid: externalIsValid,
    errorMessage: externalErrorMessage,
    onBlur,
    ...rest
}: ValidatedTextInputProps) => {
    const [isTouched, setIsTouched] = useState(false);

    // Only surface the local error once the field has lost focus.
    const hasClientError = isTouched && !validate(value);

    const isValid = externalIsValid !== false && !hasClientError;
    const errorMessage =
        externalIsValid === false
            ? externalErrorMessage
            : hasClientError
              ? validationMessage
              : undefined;

    return (
        <Input
            {...rest}
            value={value}
            isValid={isValid}
            errorMessage={errorMessage}
            onBlur={(event) => {
                setIsTouched(true);
                onBlur?.(event);
            }}
        />
    );
};
