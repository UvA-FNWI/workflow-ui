import {Grid, GridItem, Popover, type PopoverState, Text} from "@uva-fnwi/datanose-ui";

import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricPopoverProps {
    rubrics: RubricEntry[];
    triggerRef: React.RefObject<HTMLButtonElement> | null;
    state: PopoverState;
    onSelectionChange?: (selected: Selection) => void;
}

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

export function RubricPopover({rubrics, state, triggerRef}: RubricPopoverProps) {
    const {l} = useTranslate("workflow");
    console.log(rubrics);
    return (
        <Popover
            state={state}
            triggerRef={triggerRef as React.RefObject<HTMLElement>}
            className="max-h-[80vh] w-200 overflow-y-auto bg-grey-200 dark:bg-grey-800"
        >
            <Grid rowGap="none" className="p-2">
                {rubrics.map((rubricEntry, index) => (
                    <GridItem key={index} span={12} className="h-full">
                        <div className="flex h-full items-stretch gap-x-2">
                            {/* Left: grades stacked */}
                            <div className="flex h-full max-w-20 min-w-15 flex-col justify-between">
                                {rubricEntry.grades.map((grade, i) => (
                                    <div
                                        key={i}
                                        className="flex min-h-8 flex-1 items-center justify-center bg-red-brand text-sm text-white last:mb-0"
                                    >
                                        {grade}
                                    </div>
                                ))}
                            </div>

                            {/* Right: description, same height as grade stack */}
                            <div className="flex-1 border-b border-grey-800 dark:border-grey-200">
                                <Text className="p-2">{l(rubricEntry.description)}</Text>
                            </div>
                        </div>
                    </GridItem>
                ))}
            </Grid>
        </Popover>
    );
}
