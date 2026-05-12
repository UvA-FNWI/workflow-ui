import {
    Grid,
    GridItem,
    Item,
    ListBox,
    Popover,
    type PopoverState,
    Text,
} from "@uva-fnwi/datanose-ui";

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

export function RubricPopover({rubrics, state, triggerRef, onSelectionChange}: RubricPopoverProps) {
    const {l} = useTranslate("workflow");
    const allGrades = rubrics.flatMap((rubricEntry) => rubricEntry.grades);
    console.log(rubrics);
    return (
        <Popover
            state={state}
            triggerRef={triggerRef as React.RefObject<HTMLElement>}
            className="w-200 bg-grey-200 dark:bg-grey-900"
        >
            <Grid>
                <GridItem span={2}>
                    <ListBox
                        aria-label="grades"
                        selectionMode="single"
                        onSelectionChange={onSelectionChange}
                        className="max-h-full p-0"
                        itemClassName="bg-red-brand text-white hover:bg-grey-600"
                    >
                        {allGrades.map((grade, index) => (
                            <Item key={index} textValue={grade}>
                                {grade}
                            </Item>
                        ))}
                    </ListBox>
                </GridItem>
                <GridItem span={10}>
                    <div className="flex h-full flex-col text-sm text-gray-600">
                        {rubrics.map((rubricEntry, index) => (
                            <div
                                key={index}
                                className="mr-2 flex items-center border-b border-black last:border-b-0"
                                style={{flex: rubricEntry.grades.length}}
                            >
                                <Text className="p-2">{l(rubricEntry.description)}</Text>
                            </div>
                        ))}
                    </div>
                </GridItem>
            </Grid>
        </Popover>
    );
}
