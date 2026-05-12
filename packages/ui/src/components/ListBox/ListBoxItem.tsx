import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useOption } from 'react-aria';
import { ListState, Node } from 'react-stately';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { selectionVariants } from '../Select/SelectionVariants';

interface ListBoxItemProps<T> {
  item: Node<T>;
  state: ListState<T>;
  className?: string;
}

export function ListBoxItem<T>({
  item,
  state,
  className,
}: ListBoxItemProps<T>) {
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
        'ui:flex ui:items-center ui:justify-between ui:gap-2 ui:px-2 ui:py-2 ui:text-sm ui:transition-colors ui:duration-150 ui:outline-none',
        selectionVariants({
          isSelected,
          isHovered,
          isDisabled,
          isFocusVisible,
        }),
        className
      )}
    >
      <div className="ui:flex ui:items-center ui:gap-2">
        <div className="ui:flex ui:h-4 ui:w-4 ui:flex-none ui:items-center ui:justify-center">
          {isSelected && (
            <Icon name="checkmark-solid" size="sm" color="current" />
          )}
          {!isSelected && item.key === 'new-item' && (
            <Icon name="plus-solid" size="sm" color="current" />
          )}
        </div>
        <div className="ui:w-full">{item.rendered}</div>
      </div>
    </li>
  );
}
