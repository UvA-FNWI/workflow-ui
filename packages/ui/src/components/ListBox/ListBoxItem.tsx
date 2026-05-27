import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useOption } from 'react-aria';
import { ListState, Node } from 'react-stately';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { selectionVariants } from '../Select/SelectionVariants';

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
        'ui:flex ui:items-center ui:justify-between ui:gap-2 ui:px-2 ui:py-2 ui:text-sm ui:transition-colors ui:duration-150 ui:outline-none',
        selectionVariants({
          isSelected,
          isHovered,
          isDisabled,
          isFocusVisible,
        })
      )}
    >
      <div className="ui:flex ui:w-full ui:items-center ui:gap-2">
        <div className="ui:flex ui:h-4 ui:w-4 ui:flex-none ui:items-center ui:justify-center">
          {isSelected && <Icon name="checkmark-solid" size="sm" />}
          {!isSelected && item.key === 'new-item' && (
            <Icon name="plus-solid" size="sm" />
          )}
        </div>
        <div className="ui:w-full">{item.rendered}</div>
      </div>
    </li>
  );
}

export function useListBoxItem<T>(
  item: Node<T>,
  state: ListState<T>,
  ref: React.RefObject<HTMLLIElement>
): {
  optionProps: React.HTMLAttributes<HTMLElement>;
  hoverProps: React.HTMLAttributes<HTMLElement>;
  isSelected: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isHovered: boolean;
} {
  // Core option behavior (selection, focus, keyboard, press)
  const { optionProps, isSelected, isDisabled, isFocused } = useOption(
    {
      key: item.key,
      isDisabled: state.disabledKeys.has(item.key),
    },
    state,
    ref
  );

  // Hover behavior
  const { hoverProps, isHovered } = useHover({
    isDisabled,
  });

  return {
    optionProps,
    hoverProps,
    isSelected,
    isDisabled,
    isFocused,
    isHovered,
  };
}
