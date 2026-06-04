import { AriaListBoxOptions } from 'react-aria';
import { ListProps, ListState } from 'react-stately';

import { cn } from '../../utils/cn';
import { ListBoxItem } from './ListBoxItem';
import { ListBoxWrapper } from './ListBoxWrapper';

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
          <ListBoxItem item={item} state={state} key={item.key} />
        ))
      }
    </ListBoxWrapper>
  );
}

// Re-export Item for convenient usage
export { Item } from 'react-stately';

// Export types for consumers
export type { ListState };
