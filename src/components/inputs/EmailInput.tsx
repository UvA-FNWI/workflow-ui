import {ValidatedTextInput, type ValidatedTextInputProps} from "./ValidatedTextInput";
import {useTranslate} from "~/hooks/useTranslate";
import {isValidEmail} from "~/utils/inputValidation";

export type EmailInputProps = Omit<
    ValidatedTextInputProps,
    "validate" | "validationMessage" | "type"
> & {
    validationMessage?: string;
};

export const EmailInput = ({validationMessage, ...props}: EmailInputProps) => {
    const {t} = useTranslate("workflow");

    return (
        <ValidatedTextInput
            {...props}
            type="email"
            validate={isValidEmail}
            validationMessage={validationMessage ?? t("validation.email")}
        />
    );
};
