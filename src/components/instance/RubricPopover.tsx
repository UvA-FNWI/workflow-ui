import {
    Grid,
    GridItem,
    ListBox,
    ListBoxItem,
    type ListState,
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
    onSelectionChange?: (selected: string) => void;
    selectedKey?: string;
}

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

type GradeItem = {key: number; grade: string};

export function RubricPopover({
    rubrics,
    state,
    triggerRef,
    onSelectionChange,
    selectedKey,
}: RubricPopoverProps) {
    const {l} = useTranslate("workflow");

    const allGrades = rubrics.flatMap((r) => r.grades);

    const handleSelectionChange = (selected: Selection) => {
        if (!onSelectionChange || selected === "all" || selected.size === 0) return;
        const index = Number([...selected][0]);
        const grade = allGrades[index];
        if (grade !== undefined) {
            onSelectionChange(grade);
            state.close();
        }
    };

    return (
        <Popover
            state={state}
            triggerRef={triggerRef as React.RefObject<HTMLElement>}
            className="max-h-[80vh] max-w-200 overflow-y-auto bg-grey-300 shadow-xl outline-none dark:bg-grey-700"
        >
            <ListBox<GradeItem>
                items={allGrades.map((g, i) => ({key: i, grade: g}))}
                selectedKeys={selectedKey}
                onSelectionChange={handleSelectionChange}
                selectionMode="single"
            >
                {(listState: ListState<GradeItem>) => (
                    <Grid rowGap="none">
                        {rubrics.map((rubricEntry, index) => (
                            <GridItem key={index} span={12} className="h-full">
                                <div className="flex h-full items-stretch gap-x-2 pl-4">
                                    <div
                                        className={`flex-1 border-grey-800 dark:border-grey-200 ${index === rubrics.length - 1 ? "border-b-0" : "border-b"}`}
                                    >
                                        <Text className="px-2 py-4">
                                            {l(rubricEntry.description)}
                                        </Text>
                                    </div>
                                    <div className="flex h-full max-w-20 min-w-15 flex-col justify-between">
                                        {rubricEntry.grades.map((grade, i) => {
                                            const globalIndex =
                                                rubrics
                                                    .slice(0, index)
                                                    .reduce((sum, r) => sum + r.grades.length, 0) +
                                                i;

                                            const item = listState.collection.getItem(
                                                globalIndex.toString(),
                                            );

                                            if (!item) return null;

                                            return (
                                                <ListBoxItem
                                                    key={globalIndex}
                                                    item={item}
                                                    state={listState}
                                                    className="flex min-h-8 flex-1 items-center justify-center border-b border-grey-200 bg-red-brand text-sm text-white hover:bg-grey-600"
                                                >
                                                    {grade}
                                                </ListBoxItem>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GridItem>
                        ))}
                    </Grid>
                )}
            </ListBox>
        </Popover>
    );
}
