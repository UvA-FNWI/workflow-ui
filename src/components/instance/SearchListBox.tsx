import {useState} from "react";

import {Item, ListBox, type ListBoxProps} from "@datanose/ui";

export type SearchListBoxValue = {
    key: string;
    primaryValue: string;
    secondaryValue?: string;
};

export type SearchListBoxProps = Omit<ListBoxProps<SearchListBoxValue>, "children"> & {
    items: SearchListBoxValue[];
};

// Selection type from react-stately
type Selection = "all" | Set<string | number>;

export function SearchListBox({
    items,
    onSelectionChange,
    selectionMode = "single",
    "aria-label": ariaLabel = "Search results",
}: SearchListBoxProps) {
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

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
                    <div className="flex items-center gap-2">
                        <span className="flex-1 truncate">{item.primaryValue}</span>
                        {item.secondaryValue && (
                            <span className="flex-1 truncate">{item.secondaryValue}</span>
                        )}
                    </div>
                </Item>
            )}
        </ListBox>
    );
}
