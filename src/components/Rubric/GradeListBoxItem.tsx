import {useRef} from "react";

import {type ListState, type Node} from "react-stately";

import {cn, useListBoxItem} from "@uva-fnwi/datanose-ui";
import {cva} from "class-variance-authority";

type GradeItem = {key: number; grade: string};

const gradeSelectionVariants = cva(
    "ui:text-white ui:cursor-pointer ui:transition-colors ui:duration-150 ui:outline-none",
    {
        variants: {
            isSelected: {
                true: "ui:bg-black",
                false: "ui:bg-red-600",
            },
            isHovered: {
                true: "ui:bg-red-700",
                false: undefined,
            },
            isDisabled: {
                true: "ui:cursor-not-allowed ui:bg-grey-100 ui:opacity-60 ui:dark:bg-grey-800",
                false: undefined,
            },
            isFocusVisible: {
                true: "ui:ring-2 ui:ring-navy-600 ui:ring-inset ui:dark:ring-orange-500",
                false: undefined,
            },
        },
        defaultVariants: {
            isDisabled: false,
            isFocusVisible: false,
            isHovered: false,
            isSelected: false,
        },
    },
);
interface GradeListBoxItemProps {
    item: Node<GradeItem>;
    state: ListState<GradeItem>;
    className?: string;
    isLastItem?: boolean;
}
export function GradeListBoxItem({
    item,
    state,
    className,
    isLastItem = false,
}: GradeListBoxItemProps) {
    const ref = useRef<HTMLLIElement>(null);

    const {optionProps, hoverProps, isSelected, isDisabled, isFocused, isHovered} = useListBoxItem(
        item,
        state,
        ref as React.RefObject<HTMLLIElement>,
    );

    return (
        <div
            {...optionProps}
            {...hoverProps}
            className={cn(
                gradeSelectionVariants({
                    isSelected,
                    isDisabled,
                    isFocusVisible: isFocused,
                    isHovered,
                }),
                "flex min-h-8 flex-1 items-center justify-center border-grey-200 p-2 text-sm focus:ring-offset-1",
                isLastItem ? "border-b-0" : "border-b",
                className,
            )}
        >
            {item.value?.grade}
        </div>
    );
}
