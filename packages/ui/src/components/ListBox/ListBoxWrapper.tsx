import { useRef } from 'react';

import { useListBox } from 'react-aria';
import { ListProps, ListState, useListState } from 'react-stately';

import { ListBoxProps } from './ListBox';

export interface ListBoxWrapperProps<T extends object> extends Omit<
  ListBoxProps<T>,
  'children'
> {
  /** UI renderer: receives the ListState */
  children: (state: ListState<T>) => React.ReactNode;

  /** Item renderer for useListState */
  itemRenderer: ListProps<T>['children'];
}

export function ListBoxWrapper<T extends object>({
  selectionMode,
  selectedKeys,
  onSelectionChange,
  disabledKeys,
  items,
  className,
  children,
  itemRenderer,
  'aria-label': ariaLabel = 'Listbox',
  ...restProps
}: ListBoxWrapperProps<T>) {
  // Normalize selectedKeys: wrap strings in an array to prevent character splitting
  const normalizedSelectedKeys =
    typeof selectedKeys === 'string'
      ? new Set([selectedKeys])
      : Array.isArray(selectedKeys)
        ? new Set(selectedKeys)
        : selectedKeys;

  const state = useListState({
    selectionMode,
    selectedKeys: normalizedSelectedKeys,
    disabledKeys,
    onSelectionChange,
    items,
    children: itemRenderer,
  });
  const ref = useRef(null);
  const { listBoxProps } = useListBox(
    { 'aria-label': ariaLabel, ...restProps },
    state,
    ref
  );

  return (
    <ul {...listBoxProps} ref={ref} className={className}>
      {children(state)}
    </ul>
  );
}
