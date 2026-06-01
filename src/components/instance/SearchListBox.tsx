import {useState} from "react";

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

    return (
        <ListBox
            items={items}
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectionChange}
            selectionMode={selectionMode}
            aria-label={ariaLabel}
        >
            {(item) => (
                <Item key={item.key} textValue={item.primaryValue}>
                    <div className="grid min-w-0 grid-cols-[2fr_2fr_1fr] items-center gap-2">
                        <Text truncate>{item.primaryValue}</Text>
                        <Text intent="secondary" truncate>
                            {item.secondaryValue}
                        </Text>
                        <Text intent="secondary" truncate>
                            {item.tertiaryValue}
                        </Text>
                    </div>
                </Item>
            )}
        </ListBox>
    );
}
