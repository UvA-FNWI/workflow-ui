import {useCallback} from "react";

import {Input, NumberInput} from "@datanose/ui";
import {parseISO} from "date-fns";

import {DatePicker} from "~/components/Datepicker/Datepicker";
import {useDebounce} from "~/hooks/useDebounce";
import type {AnswerInput, FileParams} from "~/store/api/types/params";
import type {Answer, Question} from "~/store/api/types/submissions";

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
    if (question.type === "Date") {
        return (
            <DatePicker value={toDate(value)} onChange={(newValue) => debouncedChange(newValue)} />
        );
    }

    return <div>Not supported type...</div>;
};
