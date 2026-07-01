import {ValidatedTextInput, type ValidatedTextInputProps} from "./ValidatedTextInput";
import {useTranslate} from "~/hooks/useTranslate";
import {isValidPhone} from "~/utils/inputValidation";

export type PhoneInputProps = Omit<
    ValidatedTextInputProps,
    "validate" | "validationMessage" | "type"
> & {
    validationMessage?: string;
};

export const PhoneInput = ({validationMessage, ...props}: PhoneInputProps) => {
    const {t} = useTranslate("workflow");

    return (
        <ValidatedTextInput
            {...props}
            type="tel"
            validate={isValidPhone}
            validationMessage={validationMessage ?? t("validation.phone")}
        />
    );
};
