import {useRef} from "react";

import {Button, InputLabel, Select, SelectItem, usePopoverState} from "@uva-fnwi/datanose-ui";

import {RubricPopover} from "~/components/instance/RubricPopover.tsx";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricSelectProps {
    label?: string;
    rubrics: RubricEntry[];
}

export function RubricSelect({label, rubrics}: RubricSelectProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const popoverState = usePopoverState();

    return (
        <div>
            {label && <InputLabel>{label}</InputLabel>}
            <Select>
                {rubrics.map((rubricEntry) => (
                    <SelectItem key={rubricEntry.name} title={rubricEntry.name}>
                        {rubricEntry.name}
                    </SelectItem>
                ))}
            </Select>
            <Button ref={ref} onClick={popoverState.toggle} intent="primary">
                Open popover
            </Button>
            {popoverState.isOpen && (
                <RubricPopover
                    rubrics={rubrics}
                    state={popoverState}
                    triggerRef={ref as React.RefObject<HTMLButtonElement>}
                />
            )}
        </div>
    );
}
