import {
    Grid,
    GridItem,
    Item,
    ListBoxWrapper,
    type ListState,
    Popover,
    type PopoverState,
} from "@uva-fnwi/datanose-ui";

import {MarkdownRenderer} from "~/components/MarkdownRenderer.tsx";
import {GradeListBoxItem} from "~/components/Rubric/GradeListBoxItem.tsx";
import {useTranslate} from "~/hooks/useTranslate.ts";
import type {RubricEntry} from "~/store/api/types/submissions.ts";

interface RubricPopoverProps {
    rubrics: RubricEntry[];
    triggerRef: React.RefObject<HTMLButtonElement> | null;
    state: PopoverState;
    onSelectionChange?: (selected: string) => void;
    selectedGrade?: string;
}

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

type GradeItem = {key: number; grade: string};

export function RubricPopover({
    rubrics,
    state,
    triggerRef,
    onSelectionChange,
    selectedGrade,
}: RubricPopoverProps) {
    const {l} = useTranslate("workflow");

    const allGrades = rubrics.flatMap((r) => r.grades);
    const selectedIndex =
        selectedGrade !== undefined ? allGrades.findIndex((g) => g.name === selectedGrade) : -1;
    const selectedKeys =
        selectedIndex >= 0 ? new Set([selectedIndex.toString()]) : new Set<string>();

    const handleSelectionChange = (selected: Selection) => {
        if (!onSelectionChange || selected === "all" || selected.size === 0) return;
        const index = Number([...selected][0]);
        const grade = allGrades[index];
        if (grade !== undefined) {
            onSelectionChange(grade.name);
            state.close();
        }
    };

    return (
        <Popover
            state={state}
            triggerRef={triggerRef as React.RefObject<HTMLElement>}
            placement="top end"
            className="my-0 max-h-[80vh] max-w-200 overflow-y-auto border border-grey-500 bg-grey-200 shadow-md outline-none dark:bg-grey-800"
        >
            <ListBoxWrapper<GradeItem>
                items={allGrades.map((g, i) => ({key: i, grade: l(g.text) ?? g.name}))}
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
                selectionMode="single"
                itemRenderer={(item) => (
                    <Item key={item.key} textValue={item.grade}>
                        {item.grade}
                    </Item>
                )}
            >
                {(listState: ListState<GradeItem>) => (
                    <Grid rowGap="none">
                        {rubrics.map((rubricEntry, index) => {
                            const offset = rubrics
                                .slice(0, index)
                                .reduce((sum, r) => sum + r.grades.length, 0);

                            return (
                                <GridItem key={index} span={12} className="h-full">
                                    <div className="flex h-full items-stretch gap-x-2 pr-4">
                                        <div className="flex h-full max-w-20 min-w-15 flex-col justify-between">
                                            {rubricEntry.grades.map((_, i) => {
                                                const globalIndex = offset + i;

                                                const item = listState.collection.getItem(
                                                    globalIndex.toString(),
                                                );

                                                if (!item) return null;

                                                const isLastItem =
                                                    index === rubrics.length - 1 &&
                                                    i === rubricEntry.grades.length - 1;

                                                return (
                                                    <GradeListBoxItem
                                                        key={globalIndex}
                                                        item={item}
                                                        state={listState}
                                                        isLastItem={isLastItem}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div
                                            className={`flex-1 border-grey-800 dark:border-grey-200 ${index === rubrics.length - 1 ? "border-b-0" : "border-b"}`}
                                        >
                                            <div className="px-2 py-2">
                                                <MarkdownRenderer>
                                                    {l(rubricEntry.description) ?? ""}
                                                </MarkdownRenderer>
                                            </div>
                                        </div>
                                    </div>
                                </GridItem>
                            );
                        })}
                    </Grid>
                )}
            </ListBoxWrapper>
        </Popover>
    );
}
