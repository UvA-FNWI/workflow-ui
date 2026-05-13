import {useState} from "react";

import {Icon, ListBox, ListBoxItem, type ListBoxProps} from "@uva-fnwi/datanose-ui";

export type SearchListBoxValue = {
    key: string;
    primaryValue: string;
    secondaryValue?: string;
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
            className="max-h-[200px] overflow-y-auto rounded-xs border border-grey-300 bg-white text-grey-900 outline-none dark:border-grey-600 dark:bg-grey-900 dark:text-white"
        >
            {(state) =>
                [...state.collection].map((item) => {
                    const {primaryValue, secondaryValue} = item.value as SearchListBoxValue;
                    const isSelected = state.selectionManager.isSelected(item.key);
                    return (
                        <ListBoxItem key={item.key} item={item} state={state}>
                            <div className="flex items-center justify-between gap-2 border-b border-grey-400 px-2 py-2 text-sm transition-colors duration-150 outline-none dark:border-grey-600">
                                <div className="flex h-4 w-4 flex-none items-center justify-center">
                                    {isSelected && (
                                        <Icon name="checkmark-solid" size="sm" color="current" />
                                    )}
                                    {!isSelected && item.key === "new-item" && (
                                        <Icon name="plus-solid" size="sm" color="current" />
                                    )}
                                </div>
                                <div className="flex w-full justify-center">
                                    <span className="flex-1 truncate">{primaryValue}</span>
                                    {secondaryValue && (
                                        <span className="flex-1 truncate">{secondaryValue}</span>
                                    )}
                                </div>
                            </div>
                        </ListBoxItem>
                    );
                })
            }
        </ListBox>
    );
}
