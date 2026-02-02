import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useOption } from 'react-aria';
import { ListState, Node } from 'react-stately';

import { cn } from '../../utils/cn';

interface ListBoxItemProps<T> {
  item: Node<T>;
  state: ListState<T>;
}

export function ListBoxItem<T>({ item, state }: ListBoxItemProps<T>) {
  const ref = useRef<HTMLLIElement>(null);
  const { optionProps, isSelected, isDisabled } = useOption(
    { key: item.key },
    state,
    ref
  );

  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });

  return (
    <li
      {...mergeProps(optionProps, focusProps, hoverProps)}
      ref={ref}
      className={cn(
        'ui:cursor-pointer ui:px-4 ui:py-2 ui:transition-colors ui:duration-150 ui:outline-none',
        isSelected && 'ui:bg-grey-100 ui:dark:bg-grey-800',
        isHovered && !isSelected && 'ui:bg-grey-50 ui:dark:bg-grey-850',
        isFocusVisible &&
          'ui:ring-2 ui:ring-navy-600 ui:ring-inset ui:dark:ring-orange-500',
        isDisabled && 'ui:cursor-not-allowed ui:bg-transparent ui:opacity-50'
      )}
    >
      {item.rendered}
    </li>
  );
}
