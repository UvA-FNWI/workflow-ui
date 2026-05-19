import {useCallback, useState} from "react";

import {InputLabel, Select, SelectItem} from "@uva-fnwi/datanose-ui";

import {RubricPopover} from "~/components/instance/RubricPopover.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricSelectProps {
    label?: string;
    rubrics: RubricEntry[];
    onChange?: (selected: string) => void;
    value?: string;
}

export function RubricSelect({label, rubrics, onChange, value}: RubricSelectProps) {
    const {t} = useTranslate("workflow");
    const [selectedGrade, setSelectedGrade] = useState<string>(value ?? "");

    const handleGradeSelect = useCallback(
        (selected: string) => {
            setSelectedGrade(selected);
            onChange?.(selected);
        },
        [onChange],
    );

    return (
        <div>
            {label && <InputLabel>{label}</InputLabel>}
            <Select
                value={selectedGrade}
                customPopover={({state, triggerRef}) => (
                    <RubricPopover
                        rubrics={rubrics}
                        state={state}
                        triggerRef={triggerRef as React.RefObject<HTMLButtonElement>}
                        onSelectionChange={handleGradeSelect}
                        selectedKey={selectedGrade}
                    />
                )}
                placeholder={t("select")}
            >
                {rubrics.flatMap((rubricEntry) =>
                    rubricEntry.grades.map((grade) => <SelectItem key={grade}>{grade}</SelectItem>),
                )}
            </Select>
        </div>
    );
}
