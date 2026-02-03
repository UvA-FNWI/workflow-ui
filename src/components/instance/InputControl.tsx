import {useCallback} from "react";

import {Checkbox, Input, NumberInput, Radio, RadioGroup} from "@datanose/ui";
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
    const {l} = useTranslate("workflow");

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

    if (question.type === "String") {
        return (
            <Input
                value={(value as string) || ""}
                onChange={(value) => {
                    debouncedChange(value);
                }}
            />
        );
    }
    if (question.type === "Int") {
        return (
            <NumberInput
                value={(value as number) || 0}
                step={1}
                onChange={(value) => {
                    debouncedChange(value);
                }}
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
            />
        );
    }

    if (question.type === "Choice") {
        const choices = visibleChoices
            ? question.choices.filter((choice) => visibleChoices.includes(choice.name))
            : question.choices;

        if (question.layout && "type" in question.layout && question.layout.type === "RadioList") {
            if (question.isArray) {
                // Checkbox list for multi-select
                const selectedValues = (value as string[]) || [];

                const handleCheckboxChange = (choiceName: string, isSelected: boolean) => {
                    const newValues = isSelected
                        ? [...selectedValues, choiceName]
                        : selectedValues.filter((v) => v !== choiceName);
                    debouncedChange(newValues);
                };

                return (
                    <div className="flex flex-col gap-2">
                        {choices.map((choice) => (
                            <Checkbox
                                key={choice.name}
                                label={l(choice.text) ?? choice.name}
                                isSelected={selectedValues.includes(choice.name)}
                                onChange={(isSelected) =>
                                    handleCheckboxChange(choice.name, isSelected)
                                }
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
                        debouncedChange(selectedValue);
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

        // Default: dropdown (with multiselect if isArray is true)
        return <div>Placeholder for dropdown</div>;
    }

    return <div>Not supported type...</div>;
};
