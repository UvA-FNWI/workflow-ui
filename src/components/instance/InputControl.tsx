import {useCallback} from "react";

import {
    Checkbox,
    Input,
    NumberInput,
    Radio,
    RadioGroup,
    Select,
    SelectItem,
    TextArea,
} from "@datanose/ui";
import {parseISO} from "date-fns";

import {UserPicker} from "../UserPicker/UserPicker";
import {DatePicker} from "~/components/Datepicker/Datepicker";
import {useDebounce} from "~/hooks/useDebounce";
import {useTranslate} from "~/hooks/useTranslate";
import type {AnswerInput, FileParams} from "~/store/api/types/params";
import type {Answer, Question} from "~/store/api/types/submissions";
import type {UserSearchResult} from "~/store/api/types/users";

const toDate = (value: unknown) => {
    if (!value) return undefined;
    try {
        const date = typeof value === "string" ? parseISO(value) : value;
        return date instanceof Date ? date : undefined;
    } catch {
        return undefined;
    }
};

interface InputControlProps {
    value?: unknown;
    question: Question;
    onChange?: (val: unknown) => void;
    onSave?: (val: AnswerInput) => void;
    // These extra props will be used later
    onFileSave?: (params: FileParams) => void;
    answer?: Answer;
    visibleChoices?: string[] | null;
}

export const InputControl = ({
    value,
    question,
    onChange,
    onSave,
    visibleChoices,
}: InputControlProps) => {
    const {t, l, i18n} = useTranslate("workflow");

    const save = useCallback(
        (value: unknown) => {
            onSave?.({questionName: question.name, value});
        },
        [question.name, onSave],
    );
    const debouncedOnChange = useDebounce(save, 500);
    const debouncedChange = (value: unknown) => {
        onChange?.(value);
        debouncedOnChange(value);
    };
    const immediateChange = (value: unknown) => {
        onChange?.(value);
        save(value);
    };

    if (question.type === "String") {
        const isMultilineString =
            question.type === "String" &&
            question.layout != null &&
            "multiline" in question.layout &&
            question.layout.multiline === true;
        const lengthValidationDescription = question.maxLength
            ? t("string_validation", {
                  maxInputLength: question.maxLength,
                  remainingInputLength:
                      question.maxLength - (typeof value === "string" ? value.length : 0),
              })
            : "";

        const StringField = isMultilineString ? TextArea : Input;

        return (
            <StringField
                value={(value as string) || ""}
                onChange={(value) => {
                    debouncedChange(value);
                }}
                description={lengthValidationDescription}
                maxLength={question.maxLength}
            />
        );
    }
    if (question.type === "Int" || question.type === "Double") {
        return (
            <NumberInput
                value={(value as number) || 0}
                step={question.type === "Int" ? 1 : 0.01}
                onChange={(value) => {
                    debouncedChange(value);
                }}
                locale={i18n.language}
            />
        );
    }

    if (question.type === "Date") {
        return (
            <DatePicker value={toDate(value)} onChange={(newValue) => debouncedChange(newValue)} />
        );
    }
    if (question.type === "User") {
        return (
            <UserPicker
                value={value as UserSearchResult | UserSearchResult[] | null | undefined}
                onChange={(newValue) => debouncedChange(newValue)}
                allowsExternalUsers={question.allowsExternalUsers}
            />
        );
    }

    if (question.type === "Choice") {
        const choices = visibleChoices
            ? question.choices.filter((choice) => visibleChoices.includes(choice.name))
            : question.choices;
        const isDropdown =
            question.layout && "type" in question.layout && question.layout.type === "Dropdown";

        if (isDropdown) {
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
                            immediateChange(normalizedValues);
                        }}
                    >
                        {choices.map((choice) => (
                            <SelectItem key={choice.name}>
                                {l(choice.text) ?? choice.name}
                            </SelectItem>
                        ))}
                    </Select>
                );
            }

            return (
                <Select
                    value={typeof value === "string" ? value : null}
                    onChange={(selectedValue) => {
                        immediateChange(selectedValue != null ? String(selectedValue) : null);
                    }}
                >
                    {choices.map((choice) => (
                        <SelectItem key={choice.name}>{l(choice.text) ?? choice.name}</SelectItem>
                    ))}
                </Select>
            );
        }

        if (question.layout && "type" in question.layout && question.layout.type === "Dropdown") {
            return (
                <Select
                    value={(value as string) || ""}
                    onChange={(selectedValue) => debouncedChange(selectedValue)}
                >
                    {choices.map((choice) => (
                        <SelectItem key={choice.name} title={l(choice.text) ?? choice.name}>
                            {l(choice.text) ?? choice.name}
                        </SelectItem>
                    ))}
                </Select>
            );
        }

        if (question.isArray) {
            // Checkbox list for multi-select
            const selectedValues = (value as string[]) || [];

            const handleCheckboxChange = (choiceName: string, isSelected: boolean) => {
                const newValues = isSelected
                    ? [...selectedValues, choiceName]
                    : selectedValues.filter((v) => v !== choiceName);
                immediateChange(newValues);
            };

            return (
                <div className="flex flex-col gap-2">
                    {choices.map((choice) => (
                        <Checkbox
                            key={choice.name}
                            label={l(choice.text) ?? choice.name}
                            isSelected={selectedValues.includes(choice.name)}
                            onChange={(isSelected) => handleCheckboxChange(choice.name, isSelected)}
                        />
                    ))}
                </div>
            );
        }

        // RadioGroup for single select
        return (
            <RadioGroup
                value={(value as string) || ""}
                onChange={(selectedValue: string) => {
                    immediateChange(selectedValue);
                }}
            >
                {choices.map((choice) => (
                    <Radio key={choice.name} value={choice.name}>
                        {l(choice.text)}
                    </Radio>
                ))}
            </RadioGroup>
        );
    }

    return <div>Not supported type...</div>;
};
