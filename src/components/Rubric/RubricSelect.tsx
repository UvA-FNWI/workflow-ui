import {useCallback, useRef, useState} from "react";

import {InputLabel, SelectInput, SelectItem, useSelectControl} from "@uva-fnwi/datanose-ui";

import {RubricPopover} from "~/components/Rubric/RubricPopover.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricSelectProps {
    label?: string;
    rubrics: RubricEntry[];
    onChange?: (selected: string) => void;
    value?: string;
    isValid?: boolean;
    description?: string;
    errorMessage?: string;
}

export function RubricSelect({
    label,
    rubrics,
    onChange,
    value,
    isValid,
    description,
    errorMessage,
}: RubricSelectProps) {
    const {t, l} = useTranslate("workflow");
    const [selectedGrade, setSelectedGrade] = useState<string>(value ?? "");

    const handleGradeSelect = useCallback(
        (selected: string) => {
            setSelectedGrade(selected);
            onChange?.(selected);
        },
        [onChange],
    );
    const triggerRef = useRef<HTMLButtonElement>(null);

    const {state, labelProps, triggerProps, valueProps} = useSelectControl(
        {
            label,
            placeholder: t("select"),
            value: value ?? null,
            onChange: (key) => handleGradeSelect(key as string),
            isInvalid: !isValid,
            children: rubrics.flatMap((rubricEntry) =>
                rubricEntry.grades.map((grade) => (
                    <SelectItem key={grade.name}>{l(grade.text) ?? grade.name}</SelectItem>
                )),
            ),
        },
        triggerRef,
    );

    return (
        <div>
            {label && <InputLabel {...labelProps}>{label}</InputLabel>}
            <SelectInput
                state={state}
                triggerProps={triggerProps}
                valueProps={valueProps}
                triggerRef={triggerRef}
                placeholder={t("select")}
                isValid={isValid}
            />

            {state.isOpen && (
                <RubricPopover
                    rubrics={rubrics}
                    state={state}
                    triggerRef={triggerRef as React.RefObject<HTMLButtonElement>}
                    onSelectionChange={handleGradeSelect}
                    selectedGrade={selectedGrade}
                />
            )}

            {description && (
                <div className="ui:mt-1 ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
                    {description}
                </div>
            )}

            {errorMessage && !isValid && (
                <div className="ui:mt-1 ui:text-sm ui:text-red-600 ui:dark:text-red-400">
                    {errorMessage}
                </div>
            )}
        </div>
    );
}
