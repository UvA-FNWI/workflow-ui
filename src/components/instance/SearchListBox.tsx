import {useMemo, useState} from "react";

import {Item, ListBox, type ListBoxProps, Text} from "@uva-fnwi/datanose-ui";

export type SearchListBoxValue = {
    key: string;
    primaryValue: string;
    secondaryValue?: string;
    tertiaryValue?: string;
};

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

export type SearchListBoxProps = Omit<ListBoxProps<SearchListBoxValue>, "children"> & {
    items: SearchListBoxValue[];
    selectedKeys?: Selection;
};

export function SearchListBox({
    items,
    onSelectionChange,
    selectionMode = "single",
    "aria-label": ariaLabel = "Search results",
    selectedKeys: initialSelectedKeys,
}: SearchListBoxProps) {
    const [selectedKeys, setSelectedKeys] = useState<Selection>(initialSelectedKeys ?? new Set());

    const handleSelectionChange = (selected: Selection) => {
        setSelectedKeys(selected);
        onSelectionChange?.(selected);
    };

    const hasSecondary = useMemo(() => items.some((item) => item.secondaryValue), [items]);
    const hasTertiary = useMemo(() => items.some((item) => item.tertiaryValue), [items]);

    const columnCount = 1 + (hasSecondary ? 1 : 0) + (hasTertiary ? 1 : 0);
    const gridColsClass =
        columnCount === 3
            ? "grid-cols-[1fr_1fr_1fr]"
            : columnCount === 2
              ? "grid-cols-[1fr_1fr]"
              : "";

    return (
        <ListBox
            items={items}
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectionChange}
            selectionMode={selectionMode}
            aria-label={ariaLabel}
        >
            {(item: SearchListBoxValue) => (
                <Item key={item.key} textValue={item.primaryValue}>
                    <div
                        className={`min-w-0 items-center gap-2 ${gridColsClass && `grid ${gridColsClass}`}`}
                    >
                        <Text truncate>{item.primaryValue}</Text>
                        {hasSecondary && (
                            <Text intent="secondary" truncate>
                                {item.secondaryValue}
                            </Text>
                        )}
                        {hasTertiary && (
                            <Text intent="secondary" truncate>
                                {item.tertiaryValue}
                            </Text>
                        )}
                    </div>
                </Item>
            )}
        </ListBox>
    );
}
