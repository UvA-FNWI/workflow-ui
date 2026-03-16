import { AriaListBoxOptions } from 'react-aria';
import { Item, ListProps, ListState } from 'react-stately';

import { ListBox } from './ListBox';

export type SearchListBoxValue = {
  key: string;
  primaryValue: string;
  secondaryValue?: string;
};

export interface SearchListBoxProps<T extends object>
  extends Omit<ListProps<T>, 'children'>,
    Pick<
      AriaListBoxOptions<T>,
      'autoFocus' | 'shouldFocusWrap' | 'shouldSelectOnPressUp' | 'linkBehavior'
    > {
  /** CSS class name for the listbox container */
  className?: string;
  /** Accessible label for the listbox */
  'aria-label'?: string;
  values: SearchListBoxValue[];
}

export function SearchListBox<T extends object>(props: SearchListBoxProps<T>) {
  const { values, ...restProps } = props;

  return (
    <ListBox<SearchListBoxValue> {...restProps} items={values}>
      {(item: SearchListBoxValue) => (
        <Item key={item.key} textValue={item.primaryValue}>
          <div className="ui:flex ui:items-center ui:gap-4">
            <span className="ui:flex-1 ui:truncate">{item.primaryValue}</span>
            {item.secondaryValue && (
              <span className="ui:mx-auto ui:flex-1 ui:truncate">
                {item.secondaryValue}
              </span>
            )}
          </div>
        </Item>
      )}
    </ListBox>
  );
}

// Export types for consumers
export type { ListState };
