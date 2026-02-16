import { CSSProperties, useRef } from 'react';

import {
  AriaListBoxOptions,
  AriaPopoverProps,
  AriaSelectProps,
  DismissButton,
  HiddenSelect,
  mergeProps,
  Overlay,
  useButton,
  useFocusRing,
  useHover,
  useListBox,
  useOption,
  usePopover,
  useSelect,
} from 'react-aria';
import { Item, useSelectState } from 'react-stately';
import type { Node, SelectState } from 'react-stately';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { inputVariants } from '../Input/InputVariant';

interface SelectPopoverProps<T extends object>
  extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode;
  state: SelectState<T>;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const SelectPopover = <T extends object>({
  children,
  state,
  triggerRef,
  ...props
}: SelectPopoverProps<T>) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { popoverProps } = usePopover(
    {
      ...props,
      triggerRef,
      popoverRef,
      offset: 4,
    },
    state
  );

  const popoverStyle: CSSProperties = {
    ...popoverProps.style,
    minWidth: triggerRef.current?.offsetWidth,
  };

  return (
    <Overlay>
      <div
        {...popoverProps}
        ref={popoverRef}
        style={popoverStyle}
        className="ui:absolute ui:z-50 ui:mt-1"
      >
        {children}
      </div>
    </Overlay>
  );
};

interface SelectOptionProps<T extends object> {
  item: Node<T>;
  state: SelectState<T>;
}

const SelectOption = <T extends object>({
  item,
  state,
}: SelectOptionProps<T>) => {
  const ref = useRef<HTMLLIElement>(null);
  const { optionProps, isSelected, isDisabled } = useOption(
    { key: item.key },
    state,
    ref
  );
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <li
      {...mergeProps(optionProps, hoverProps, focusProps)}
      ref={ref}
      className={cn(
        'ui:flex ui:cursor-pointer ui:items-center ui:justify-between ui:gap-2 ui:rounded-sm ui:px-3 ui:py-2 ui:text-sm ui:transition-colors ui:duration-150 ui:outline-none',
        isSelected && 'ui:bg-grey-100 ui:dark:bg-grey-800',
        isHovered && !isSelected && 'ui:bg-grey-50 ui:dark:bg-grey-850',
        isFocusVisible &&
          'ui:ring-2 ui:ring-navy-600 ui:ring-inset ui:dark:ring-orange-500',
        isDisabled && 'ui:cursor-not-allowed ui:bg-transparent ui:opacity-50'
      )}
    >
      <span className="ui:flex-1 ui:truncate">{item.rendered}</span>
      {isSelected && (
        <Icon
          name="checkmark-small-line"
          size="sm"
          color="secondary"
          aria-hidden
        />
      )}
    </li>
  );
};

interface SelectListBoxProps<T extends object> extends AriaListBoxOptions<T> {
  state: SelectState<T>;
}

const SelectListBox = <T extends object>({
  state,
  ...props
}: SelectListBoxProps<T>) => {
  const ref = useRef<HTMLUListElement>(null);
  const { listBoxProps } = useListBox(props, state, ref);

  return (
    <ul
      {...listBoxProps}
      ref={ref}
      className="ui:max-h-64 ui:overflow-y-auto ui:rounded-md ui:border ui:border-grey-300 ui:bg-white ui:p-1 ui:text-black ui:shadow-lg ui:outline-none ui:dark:border-grey-600 ui:dark:bg-grey-900 ui:dark:text-white"
    >
      {[...state.collection].map(item =>
        item.type === 'item' ? (
          <SelectOption key={item.key} item={item} state={state} />
        ) : null
      )}
    </ul>
  );
};

export interface SelectProps<T extends object>
  extends Omit<
    AriaSelectProps<T>,
    'children' | 'validationState' | 'label' | 'description' | 'errorMessage'
  > {
  /** CSS class name for the select trigger */
  className?: string;
  /** Label shown above the select */
  label?: string;
  /** Description shown below the select */
  description?: string;
  /** Error text shown when invalid */
  errorMessage?: string;
  /** Marks the select as valid or invalid */
  isValid?: boolean;
  /** Select options */
  children: AriaSelectProps<T>['children'];
}

export function Select<T extends object>(props: SelectProps<T>) {
  const {
    className,
    label,
    description,
    errorMessage,
    isValid = true,
    isDisabled = false,
    placeholder,
    ...restProps
  } = props;

  const validationState = isValid === false ? 'invalid' : 'valid';
  const state = useSelectState({
    ...restProps,
    label,
    description,
    errorMessage,
    isDisabled,
    validationState,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const {
    labelProps,
    triggerProps,
    valueProps,
    menuProps,
    descriptionProps,
    errorMessageProps,
    hiddenSelectProps,
    isInvalid,
  } = useSelect(
    {
      ...restProps,
      label,
      description,
      errorMessage,
      isDisabled,
      placeholder,
      validationState,
    },
    state,
    triggerRef
  );

  const { focusProps, isFocusVisible } = useFocusRing();
  const { buttonProps } = useButton(triggerProps, triggerRef);
  const { hoverProps, isHovered } = useHover({
    isDisabled,
  });

  const invalid = isInvalid || isValid === false;
  const triggerClasses = inputVariants({
    isDisabled,
    isFocusVisible,
    isHovered,
    isValid: !invalid,
  });

  return (
    <div className="ui:w-full">
      {label && (
        <span
          {...labelProps}
          className="ui:mb-1 ui:block ui:text-sm ui:font-medium ui:text-black ui:dark:text-white"
        >
          {label}
        </span>
      )}

      <HiddenSelect {...hiddenSelectProps} />

      <button
        {...mergeProps(buttonProps, focusProps, hoverProps)}
        ref={triggerRef}
        className={cn(
          triggerClasses,
          'ui:flex ui:items-center ui:justify-between ui:gap-2 ui:text-left',
          className
        )}
      >
        <span
          {...valueProps}
          className={cn(
            'ui:flex-1 ui:truncate ui:text-left',
            state.selectedItems.length === 0 &&
              'ui:text-grey-600 ui:dark:text-grey-400'
          )}
        >
          {/* TODO: Support JSX items better */}
          {state.selectedItems.length > 0
            ? state.selectedItems.map(item => item.rendered).join(', ')
            : placeholder}
        </span>
        <Icon
          name="chevron-down-small-line"
          size="sm"
          color="secondary"
          aria-hidden
          className={cn(
            'ui:shrink-0 ui:transition-transform ui:duration-200',
            state.isOpen && 'ui:rotate-180'
          )}
        />
      </button>

      {state.isOpen && (
        <SelectPopover
          state={state}
          triggerRef={triggerRef as React.RefObject<HTMLElement>}
          placement="bottom start"
          shouldFlip
        >
          <DismissButton onDismiss={state.close} />
          <SelectListBox state={state} {...menuProps} />
          <DismissButton onDismiss={state.close} />
        </SelectPopover>
      )}

      {description && (
        <div
          {...descriptionProps}
          className="ui:mt-1 ui:text-sm ui:text-grey-600 ui:dark:text-grey-400"
        >
          {description}
        </div>
      )}

      {errorMessage && invalid && (
        <div
          {...errorMessageProps}
          className="ui:mt-1 ui:text-sm ui:text-red-600 ui:dark:text-red-400"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export { Item };
export type { SelectState };
