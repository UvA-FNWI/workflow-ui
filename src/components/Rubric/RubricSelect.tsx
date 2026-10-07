import {useCallback, useRef, useState} from "react";

import {
    Button,
    Icon,
    InputLabel,
    SelectInput,
    SelectItem,
    useSelectControl,
} from "@uva-fnwi/datanose-ui";

import {RubricPopover} from "~/components/Rubric/RubricPopover.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricSelectProps {
    label?: string;
    rubrics: RubricEntry[];
    onChange?: (selected: string | null) => void;
    allowClear?: boolean;
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
    allowClear = false,
}: RubricSelectProps) {
    const {t, l} = useTranslate("workflow");
    const [selectedGrade, setSelectedGrade] = useState<string>(value ?? "");

    const handleGradeSelect = useCallback(
        (selected: string | null) => {
            setSelectedGrade(selected ?? "");
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
            onChange: (key) => handleGradeSelect(key as string | null),
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
        <>
            {label && <InputLabel {...labelProps}>{label}</InputLabel>}
            <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                    <SelectInput
                        state={state}
                        triggerProps={triggerProps}
                        valueProps={valueProps}
                        triggerRef={triggerRef}
                        placeholder={t("select")}
                        isValid={isValid}
                    />
                </div>
                {allowClear && value && (
                    <Button
                        intent="ghost"
                        size="small"
                        shape="circular"
                        aria-label={t("clear_selection")}
                        title={t("clear_selection")}
                        onClick={() => {
                            handleGradeSelect(null);
                            triggerRef.current?.focus();
                        }}
                    >
                        <Icon name="cross-small-line" size="xs" decorative />
                    </Button>
                )}
            </div>

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
        </>
    );
}
