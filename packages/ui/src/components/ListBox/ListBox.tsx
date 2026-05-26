import { useRef } from 'react';

import { AriaListBoxOptions, useListBox } from 'react-aria';
import { ListProps, ListState, useListState } from 'react-stately';

import { cn } from '../../utils/cn';
import { ListBoxItem } from './ListBoxItem';

interface ListItem {
  key?: string | number;
  id?: string;
  textValue?: string;
}

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
  children: ListProps<T>['children'];
}

export interface ListBoxWrapperProps<T extends object>
  extends Omit<ListBoxProps<T>, 'children'> {
  /** UI renderer: receives the ListState */
  children: (state: ListState<T>) => React.ReactNode;

  /** Item renderer for useListState */
  itemRenderer: ListProps<T>['children'];
}

export function ListBoxWrapper<T extends ListItem>({
  selectionMode,
  selectedKeys,
  onSelectionChange,
  disabledKeys,
  items,
  className,
  children,
  itemRenderer,
  'aria-label': ariaLabel = 'Listbox',
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
  const { listBoxProps } = useListBox({ 'aria-label': ariaLabel }, state, ref);

  return (
    <ul {...listBoxProps} ref={ref} className={className}>
      {children(state)}
    </ul>
  );
}

export function ListBox<T extends object>(props: ListBoxProps<T>) {
  const { className, children, ...restProps } = props;

  return (
    <ListBoxWrapper
      {...restProps}
      className={cn(
        'ui:max-h-[200px] ui:overflow-y-auto ui:rounded-xs ui:border ui:border-grey-300 ui:bg-white ui:text-grey-900 ui:outline-none ui:dark:border-grey-600 ui:dark:bg-grey-900 ui:dark:text-white',
        className
      )}
      itemRenderer={children}
    >
      {(state: ListState<T>) =>
        [...state.collection].map(item => (
          <div
            key={item.key}
            className="ui:border-b ui:border-grey-300 ui:dark:border-grey-700"
          >
            <ListBoxItem item={item} state={state} />
          </div>
        ))
      }
    </ListBoxWrapper>
  );
}

// Re-export Item for convenient usage
export { Item } from 'react-stately';

// Export types for consumers
export type { ListState };
