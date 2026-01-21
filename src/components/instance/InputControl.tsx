import {useCallback} from "react";

import {Input, NumberInput} from "@datanose/ui";

import {useDebounce} from "~/hooks/useDebounce";
import type {AnswerInput, FileParams} from "~/store/api/types/params";
import type {Answer, Question} from "~/store/api/types/submissions";

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

export const InputControl = ({value, question, onChange, onSave}: InputControlProps) => {
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
    // TODO: This is a hack to support the choice type. We should create something better later.
    if (question.type === "Choice") {
        // Normalize value to always be a string array
        const normalizeValue = (val: unknown): string[] => {
            if (!val) return [];
            if (Array.isArray(val)) {
                return val.filter((v): v is string => typeof v === "string");
            }
            return typeof val === "string" ? [val] : [];
        };

        const selectedValues = normalizeValue(value);

        const handleChange = (choiceName: string, checked: boolean) => {
            const newValues = checked
                ? [...selectedValues.filter((v) => v !== choiceName), choiceName]
                : selectedValues.filter((v) => v !== choiceName);
            debouncedChange(newValues);
        };

        return (
            <>
                {question.choices.map((choice) => (
                    <div key={choice.name}>
                        <label>
                            <input
                                type="checkbox"
                                value={choice.name}
                                checked={selectedValues.includes(choice.name)}
                                onChange={(e) => handleChange(choice.name, e.target.checked)}
                            />
                            {choice.name}
                        </label>
                    </div>
                ))}
            </>
        );
    }

    return <div>Not supported type...</div>;
};
