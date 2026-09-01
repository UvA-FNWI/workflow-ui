import {useCallback} from "react";

import {
    Checkbox,
    Input,
    NumberInput,
    Radio,
    RadioGroup,
    Select,
    SelectItem,
    TagInput,
    TextArea,
} from "@uva-fnwi/datanose-ui";
import {parseISO} from "date-fns";

import {DatePicker} from "~/components/Datepicker/Datepicker";
import {EmailInput} from "~/components/inputs/EmailInput";
import {PhoneInput} from "~/components/inputs/PhoneInput";
import {ReferenceControl} from "~/components/instance/ReferenceControl.tsx";
import {RubricSelect} from "~/components/Rubric/RubricSelect.tsx";
import {UserPicker} from "~/components/UserPicker/UserPicker";
import {useDebounce} from "~/hooks/useDebounce";
import {useTranslate} from "~/hooks/useTranslate";
import type {AnswerInput, FileParams} from "~/store/api/types/params";
import type {SaveAnswerResult} from "~/store/api/types/returnTypes";
import type {Answer, Choice, ChoiceLayoutType, Question} from "~/store/api/types/submissions";
import type {CreateExternalUserInput, UserSearchResult} from "~/store/api/types/users";
import {sortChoices} from "~/utils/sortChoices";

const toDate = (value: unknown) => {
    if (value == null) return null;
    try {
        const date = typeof value === "string" ? parseISO(value) : value;
        return date instanceof Date ? date : null;
    } catch {
        return null;
    }
};

interface InputControlProps {
    instanceId: string;
    submissionId: string;
    value?: unknown;
    question: Question;
    choices?: Choice[];
    choicesLoading?: boolean;
    choicesError?: boolean;
    onChange?: (val: unknown) => void;
    onSave?: (val: AnswerInput) => Promise<SaveAnswerResult>;
    onSaveExternalUser?: (val: AnswerInput) => Promise<SaveAnswerResult>;
    onFileSave?: (params: FileParams) => void;
    answer?: Answer;
    visibleChoices?: string[] | null;
    isValid?: boolean;
    errorMessage?: string;
}

export const InputControl = ({
    instanceId,
    submissionId,
    value,
    question,
    choices,
    choicesLoading,
    choicesError,
    onChange,
    onSave,
    onSaveExternalUser,
    visibleChoices,
    isValid,
    errorMessage,
}: InputControlProps) => {
    const {t, l, i18n} = useTranslate("workflow");

    const save = useCallback(
        (value: unknown) => {
            if (!onSave) return;
            void onSave({questionName: question.name, value});
        },
        [question.name, onSave],
    );
    const saveExternalUser = onSaveExternalUser ?? onSave;
    const handleCreateExternalUser = useCallback(
        async (newUser: CreateExternalUserInput) => {
            if (!saveExternalUser) return;
            const result = await saveExternalUser({
                questionName: question.name,
                value: question.isArray ? (Array.isArray(value) ? value : []) : null,
                externalUser: newUser,
            });

            const updatedAnswer = result.answers.find(
                (answer) => answer.questionName === question.name,
            );
            if (updatedAnswer) {
                onChange?.(updatedAnswer.value);
                return;
            }

            throw new Error(`Updated user answer was not returned for question "${question.name}"`);
        },
        [onChange, saveExternalUser, question.isArray, question.name, value],
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
        if (question.isArray) {
            return (
                <TagInput
                    value={Array.isArray(value) ? value.map((item) => String(item)) : []}
                    onChange={(value) => debouncedChange(value)}
                    maxLength={question.maxLength}
                    isValid={isValid}
                    errorMessage={errorMessage}
                />
            );
        }

        const variant =
            question.layout != null && "variant" in question.layout
                ? question.layout.variant
                : undefined;

        if (variant === "Email") {
            return (
                <EmailInput
                    value={(value as string) || ""}
                    onChange={(value) => debouncedChange(value)}
                    isValid={isValid}
                    errorMessage={errorMessage}
                />
            );
        }

        if (variant === "Phone") {
            return (
                <PhoneInput
                    value={(value as string) || ""}
                    onChange={(value) => debouncedChange(value)}
                    isValid={isValid}
                    errorMessage={errorMessage}
                />
            );
        }

        const isMultilineString =
            question.layout != null && "multiline" in question.layout && question.layout.multiline;
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
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                description={lengthValidationDescription}
                maxLength={question.maxLength}
                isValid={isValid}
                errorMessage={errorMessage}
            />
        );
    }

    if (question.type === "Int" || question.type === "Double") {
        const isInt = question.type === "Int";
        return (
            <NumberInput
                value={Number.isFinite(value) ? (value as number) : undefined}
                step={isInt ? 1 : 0.01}
                minValue={isInt ? -2_147_483_648 : undefined}
                maxValue={isInt ? 2_147_483_647 : undefined}
                onChange={(value) => {
                    debouncedChange(value);
                }}
                locale={i18n.language}
                formatOptions={{useGrouping: false}}
                isValid={isValid}
                errorMessage={errorMessage}
            />
        );
    }

    if (question.type === "Date") {
        return (
            <DatePicker
                value={toDate(value)}
                onChange={(newValue) => debouncedChange(newValue)}
                isValid={isValid}
                errorMessage={errorMessage}
            />
        );
    }
    if (question.type === "User") {
        return (
            <UserPicker
                value={value as UserSearchResult | UserSearchResult[] | null | undefined}
                onChange={(newValue) => debouncedChange(newValue)}
                allowsExternalUsers={question.allowsExternalUsers}
                onCreateExternalUser={handleCreateExternalUser}
                selectionMode={question.isArray ? "multiple" : "single"}
            />
        );
    }

    if (question.type === "Boolean") {
        return (
            <Checkbox
                label={l(question.text) ?? ""}
                isSelected={value as boolean}
                onChange={(newValue) => debouncedChange(newValue)}
            />
        );
    }

    if (question.type === "Choice") {
        const isChoiceType = (choiceType: ChoiceLayoutType) =>
            question.layout && "type" in question.layout && question.layout.type === choiceType;
        const filteredChoices = visibleChoices
            ? question.choices.filter((choice) => visibleChoices.includes(choice.name))
            : question.choices;
        const choices = sortChoices(filteredChoices, question.sorting, i18n.language);

        if (isChoiceType("Dropdown")) {
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
                        placeholder={t("select")}
                        isValid={isValid}
                        errorMessage={errorMessage}
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
                    placeholder={t("select")}
                    isValid={isValid}
                    errorMessage={errorMessage}
                >
                    {choices.map((choice) => (
                        <SelectItem key={choice.name}>{l(choice.text) ?? choice.name}</SelectItem>
                    ))}
                </Select>
            );
        }

        if (isChoiceType("Rubric")) {
            return (
                <RubricSelect
                    value={typeof value === "string" ? value : undefined}
                    onChange={(selectedValue) => {
                        immediateChange(selectedValue != null ? String(selectedValue) : null);
                    }}
                    rubrics={question.rubric ?? []}
                    isValid={isValid}
                    errorMessage={errorMessage}
                />
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
                isValid={isValid}
                errorMessage={errorMessage}
            >
                {choices.map((choice) => (
                    <Radio key={choice.name} value={choice.name}>
                        {l(choice.text)}
                    </Radio>
                ))}
            </RadioGroup>
        );
    }

    if (question.type === "Reference") {
        return (
            <ReferenceControl
                instanceId={instanceId}
                submissionId={submissionId}
                value={value}
                question={question}
                choices={choices}
                choicesLoading={choicesLoading}
                choicesError={choicesError}
                onChange={(val) => immediateChange(val)}
                isValid={isValid}
                errorMessage={errorMessage}
            />
        );
    }

    return <div>Not supported type...</div>;
};
