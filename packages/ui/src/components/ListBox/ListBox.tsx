import { useRef } from 'react';

import {
  AriaListBoxOptions,
  mergeProps,
  useFocusRing,
  useListBox,
} from 'react-aria';
import { ListProps, ListState, useListState } from 'react-stately';

import { cn } from '../../utils/cn';
import { ListBoxItem } from './ListBoxItem';

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

export function ListBox<T extends object>(props: ListBoxProps<T>) {
  const { className, ...restProps } = props;
  const state = useListState(restProps);
  const ref = useRef<HTMLUListElement>(null);
  const { listBoxProps } = useListBox(restProps, state, ref);
  const { focusProps, isFocusVisible } = useFocusRing({ within: true });

  return (
    <ul
      {...mergeProps(listBoxProps, focusProps)}
      ref={ref}
      className={cn(
        'ui:max-h-[400px] ui:overflow-y-auto ui:rounded-xs ui:border ui:border-grey-300 ui:bg-white ui:text-grey-900 ui:shadow-lg ui:outline-none ui:dark:border-grey-600 ui:dark:bg-grey-900 ui:dark:text-white',
        isFocusVisible &&
          'ui:ring-2 ui:ring-navy-600 ui:ring-offset-2 ui:dark:ring-orange-500 ui:dark:ring-offset-grey-900',
        className
      )}
    >
      {[...state.collection].map(item => (
        <div className="ui:border-b ui:border-gray-300">
          <ListBoxItem key={item.key} item={item} state={state} />
        </div>
      ))}
    </ul>
  );
}

// Re-export Item for convenient usage
export { Item } from 'react-stately';

// Export types for consumers
export type { ListState };
