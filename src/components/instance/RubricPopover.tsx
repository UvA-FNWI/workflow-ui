import {Item, ListBox, Popover, type PopoverState} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricPopoverProps {
    rubrics: RubricEntry[];
    triggerRef: React.RefObject<HTMLButtonElement>;
    state: PopoverState;
    onSelectionChange?: (selected: Selection) => void;
}

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

export function RubricPopover({rubrics, state, triggerRef, onSelectionChange}: RubricPopoverProps) {
    const {l} = useTranslate("workflow");
    const ROW_HEIGHT = 36;
    const allGrades = rubrics.flatMap((rubricEntry) => rubricEntry.grades);
    console.log(rubrics);
    return (
        <Popover state={state} triggerRef={triggerRef} className="max-h-full w-200">
            <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-md">
                <div
                    className="flex flex-row border-b border-gray-200 last:border-b-0"
                    style={{height: allGrades.length * ROW_HEIGHT}}
                >
                    <ListBox
                        aria-label="grades"
                        selectionMode="single"
                        onSelectionChange={onSelectionChange}
                        className="h-full max-h-full flex-2/10 bg-red-brand"
                    >
                        {allGrades.map((grade, index) => (
                            <Item key={index} textValue={grade}>
                                <div
                                    className="flex items-center px-2"
                                    style={{height: ROW_HEIGHT}}
                                >
                                    {grade}
                                </div>
                            </Item>
                        ))}
                    </ListBox>
                    <div className="flex-9/10 gap-2 p-3 text-sm text-gray-600">
                        {rubrics.map((rubricEntry, index) => (
                            <div
                                key={index}
                                className="flex flex-col justify-center border-b border-gray-200 p-3 last:border-b-0"
                                style={{height: rubricEntry.grades.length * ROW_HEIGHT}}
                            >
                                {l(rubricEntry.description)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Popover>
    );
}
