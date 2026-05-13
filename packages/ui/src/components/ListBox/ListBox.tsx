import { useRef } from 'react';

import { AriaListBoxOptions, useListBox } from 'react-aria';
import { Item, ListProps, ListState, useListState } from 'react-stately';

export interface ListBoxProps<T extends object>
  extends Omit<ListProps<T>, 'children' | 'filter' | 'collection'>,
    Pick<
      AriaListBoxOptions<T>,
      'autoFocus' | 'shouldFocusWrap' | 'shouldSelectOnPressUp' | 'linkBehavior'
    > {
  /** CSS class name for the listbox container */
  className?: string;
  /** Accessible label for the listbox */
  'aria-label'?: string;
  /** Render function for each item */
  children: (state: ListState<T>) => React.ReactNode;
}

export function ListBox<T extends object>({
  selectionMode,
  selectedKeys,
  onSelectionChange,
  disabledKeys,
  items,
  className,
  children,
  'aria-label': ariaLabel = 'Listbox',
}: ListBoxProps<T>) {
  const state = useListState({
    selectionMode,
    selectedKeys,
    disabledKeys,
    onSelectionChange,
    items,
    children: item => (
      <Item
        key={(item as any).key}
        textValue={(item as any).textValue ?? (item as any).id}
      >
        {(item as any).key}
      </Item>
    ),
  });
  const ref = useRef(null);
  const { listBoxProps } = useListBox({ 'aria-label': ariaLabel }, state, ref);

  return (
    <ul {...listBoxProps} ref={ref} className={className}>
      {children(state)}
    </ul>
  );
}

// Re-export Item for convenient usage
export { Item } from 'react-stately';

// Export types for consumers
export type { ListState };
