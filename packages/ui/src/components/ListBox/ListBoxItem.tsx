import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useOption } from 'react-aria';
import { ListState, Node } from 'react-stately';

import { cn } from '../../utils/cn';
import { selectionVariants } from '../Select/SelectionVariants';

interface ListBoxItemProps<T> {
  item: Node<T>;
  state: ListState<T>;
  className?: string;
  intent?: 'default' | 'danger';
  children?: React.ReactNode;
}

export function ListBoxItem<T>({
  item,
  state,
  className,
  intent = 'default',
  children,
}: ListBoxItemProps<T>) {
  const ref = useRef(null);
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
        selectionVariants({
          isSelected,
          isHovered,
          isDisabled,
          isFocusVisible,
          intent,
        }),
        className
      )}
    >
      {children}
    </li>
  );
}
