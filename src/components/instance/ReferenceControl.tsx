import {
    Checkbox,
    ComboBox,
    ComboBoxItem,
    Radio,
    RadioGroup,
    Select,
    SelectItem,
} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate";
import {answersApi} from "~/store/api/answersApi";
import type {Choice, Question} from "~/store/api/types/submissions";

interface ReferenceControlProps {
    instanceId: string;
    submissionId: string;
    value?: unknown;
    question: Question;
    choices?: Choice[];
    choicesLoading?: boolean;
    choicesError?: boolean;
    onChange: (val: unknown) => void;
    isValid?: boolean;
    errorMessage?: string;
}

export const ReferenceControl = ({
    instanceId,
    submissionId,
    value,
    question,
    choices,
    choicesLoading,
    choicesError,
    onChange,
    isValid,
    errorMessage,
}: ReferenceControlProps) => {
    const {t, l} = useTranslate("workflow");

    const {
        data: fetchedChoices,
        isLoading,
        isError,
    } = answersApi.useGetChoicesQuery(
        {
            instanceId,
            submissionId,
            questionName: question.name,
        },
        {skip: choices !== undefined || !instanceId || !submissionId},
    );

    const usingParentChoices = choices !== undefined;
    const loading = Boolean(choicesLoading) || (!usingParentChoices && isLoading);
    const failed = Boolean(choicesError) || (!usingParentChoices && isError);
    const options = (usingParentChoices ? choices : fetchedChoices) ?? [];

    const placeholder = loading
        ? t("reference.loading")
        : options.length === 0
          ? t("reference.empty")
          : t("select");

    const selectState = {
        placeholder,
        isDisabled: loading || failed,
        isValid: failed ? false : isValid,
        errorMessage: failed ? t("reference.load_error") : errorMessage,
    };

    const layoutType =
        question.layout && "type" in question.layout ? question.layout.type : undefined;
    const isRadioList = layoutType === "RadioList";

    const choiceLabel = (choice: Choice) => l(choice.text)?.trim() || choice.name;

    if (isRadioList && !question.isArray) {
        return (
            <RadioGroup
                value={typeof value === "string" ? value : ""}
                onChange={onChange}
                isDisabled={selectState.isDisabled}
                isValid={selectState.isValid}
                errorMessage={selectState.errorMessage}
            >
                {options.map((choice) => (
                    <Radio key={choice.name} value={choice.name}>
                        {choiceLabel(choice)}
                    </Radio>
                ))}
            </RadioGroup>
        );
    }

    if (isRadioList && question.isArray) {
        const selectedValues = Array.isArray(value) ? value.map((v) => String(v)) : [];
        return (
            <div className="flex flex-col gap-2">
                {options.map((choice) => (
                    <Checkbox
                        key={choice.name}
                        label={choiceLabel(choice)}
                        isSelected={selectedValues.includes(choice.name)}
                        isDisabled={selectState.isDisabled}
                        isValid={selectState.isValid}
                        onChange={(isSelected) => {
                            onChange(
                                isSelected
                                    ? [...selectedValues, choice.name]
                                    : selectedValues.filter((v) => v !== choice.name),
                            );
                        }}
                    />
                ))}
            </div>
        );
    }

    if (question.isArray) {
        const selectedValues = Array.isArray(value) ? value.map((v) => String(v)) : [];
        return (
            <Select
                selectionMode="multiple"
                value={selectedValues}
                onChange={(selectedValue) => {
                    const normalizedValues = Array.isArray(selectedValue)
                        ? selectedValue.map((v) => String(v))
                        : selectedValue != null
                          ? [String(selectedValue)]
                          : [];
                    onChange(normalizedValues);
                }}
                {...selectState}
            >
                {(options ?? []).map((choice) => (
                    <SelectItem key={choice.name} textValue={choiceLabel(choice)}>
                        {choiceLabel(choice)}
                    </SelectItem>
                ))}
            </Select>
        );
    }

    return (
        <ComboBox
            value={typeof value === "string" ? value : null}
            onChange={(selectedValue) => {
                onChange(selectedValue != null ? String(selectedValue) : null);
            }}
            {...selectState}
        >
            {(options ?? []).map((choice) => (
                <ComboBoxItem key={choice.name} textValue={choiceLabel(choice)}>
                    {choiceLabel(choice)}
                </ComboBoxItem>
            ))}
        </ComboBox>
    );
};
