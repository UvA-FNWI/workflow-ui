import {InputLabel, Select, SelectItem} from "@uva-fnwi/datanose-ui";

import {RubricPopover} from "~/components/instance/RubricPopover.tsx";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricSelectProps {
    label?: string;
    rubrics: RubricEntry[];
}

type Selection = "all" | Set<string | number>;

export function RubricSelect({label, rubrics}: RubricSelectProps) {
    const onGradeSelect = (selected: Selection) => {
        console.log("Selected grades:", selected);
    };

    return (
        <div>
            {label && <InputLabel>{label}</InputLabel>}
            <Select
                customPopover={({state, triggerRef}) => (
                    <RubricPopover
                        rubrics={rubrics}
                        state={state}
                        triggerRef={triggerRef as React.RefObject<HTMLButtonElement>}
                        onSelectionChange={onGradeSelect}
                    />
                )}
            >
                {rubrics.map((rubricEntry) => (
                    <SelectItem key={rubricEntry.name}>{rubricEntry.name}</SelectItem>
                ))}
            </Select>
        </div>
    );
}
