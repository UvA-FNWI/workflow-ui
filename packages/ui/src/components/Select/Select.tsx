import { CSSProperties, useRef } from 'react';

import {
  AriaButtonProps,
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
import { InputLabel } from '../Input/InputLabel';
import { inputVariants } from '../Input/InputVariant';
import { selectionVariants } from './SelectionVariants';

type SelectSelectionMode = 'single' | 'multiple';

interface SelectPopoverProps<
  T extends object,
  M extends SelectSelectionMode = 'single',
> extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode;
  state: SelectState<T, M>;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const SelectPopover = <
  T extends object,
  M extends SelectSelectionMode = 'single',
>({
  children,
  state,
  triggerRef,
  ...props
}: SelectPopoverProps<T, M>) => {
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
        className="ui:absolute ui:z-50 ui:mt-1 ui:bg-grey-100"
      >
        {children}
      </div>
    </Overlay>
  );
};

interface SelectOptionProps<
  T extends object,
  M extends SelectSelectionMode = 'single',
> {
  item: Node<T>;
  state: SelectState<T, M>;
}

const SelectOption = <
  T extends object,
  M extends SelectSelectionMode = 'single',
>({
  item,
  state,
}: SelectOptionProps<T, M>) => {
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
        'ui:text-md ui:flex ui:items-center ui:justify-between ui:gap-2 ui:rounded-sm ui:px-3 ui:py-2 ui:transition-colors ui:duration-150 ui:outline-none',
        selectionVariants({
          isSelected,
          isHovered,
          isDisabled,
          isFocusVisible,
        })
      )}
    >
      <span className="ui:flex-1 ui:truncate">{item.rendered}</span>
    </li>
  );
};

interface SelectListBoxProps<
  T extends object,
  M extends SelectSelectionMode = 'single',
> extends AriaListBoxOptions<T> {
  state: SelectState<T, M>;
}

const SelectListBox = <
  T extends object,
  M extends SelectSelectionMode = 'single',
>({
  state,
  ...props
}: SelectListBoxProps<T, M>) => {
  const ref = useRef<HTMLUListElement>(null);
  const { listBoxProps } = useListBox(props, state, ref);

  return (
    <ul
      {...listBoxProps}
      ref={ref}
      className="ui:max-h-64 ui:overflow-y-auto ui:rounded-xs ui:border ui:border-grey-300 ui:bg-grey-100 ui:p-1 ui:shadow-lg ui:outline-none ui:dark:border-grey-600 ui:dark:bg-grey-900"
    >
      {[...state.collection].map(item =>
        item.type === 'item' ? (
          <SelectOption key={item.key} item={item} state={state} />
        ) : null
      )}
    </ul>
  );
};

interface SelectInputProps<
  T extends object,
  M extends SelectSelectionMode = 'single',
> {
  state: SelectState<T, M>;
  valueProps: React.HTMLAttributes<HTMLElement>;
  triggerProps: AriaButtonProps;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  className?: string;
  placeholder?: string;
  isDisabled?: boolean;
  isValid?: boolean;
}
export const SelectInput = <
  T extends object,
  M extends SelectSelectionMode = 'single',
>({
  state,
  valueProps,
  triggerRef,
  triggerProps,
  className,
  placeholder,
  isDisabled,
  isValid,
}: SelectInputProps<T, M>) => {
  const { focusProps, isFocusVisible } = useFocusRing();
  const { buttonProps } = useButton(triggerProps, triggerRef);
  const { hoverProps, isHovered } = useHover({
    isDisabled,
  });

  const triggerClasses = inputVariants({
    isDisabled,
    isFocusVisible,
    isHovered,
    isValid,
  });

  return (
    <button
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      ref={triggerRef}
      disabled={isDisabled}
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
  );
};

export interface SelectProps<
  T extends object,
  M extends SelectSelectionMode = 'single',
> extends Omit<
    AriaSelectProps<T, M>,
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
  children: AriaSelectProps<T, M>['children'];
}

export function Select<
  T extends object,
  M extends SelectSelectionMode = 'single',
>(props: SelectProps<T, M>) {
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

  const state = useSelectState<T, M>({
    ...restProps,
    label,
    description,
    errorMessage,
    isDisabled,
    isInvalid: !isValid,
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
  } = useSelect<T, M>(
    {
      ...restProps,
      label,
      description,
      errorMessage,
      isDisabled,
      placeholder,
      isInvalid: !isValid,
    },
    state,
    triggerRef
  );
  const invalid = isInvalid || !isValid;

  return (
    <div>
      {label && <InputLabel {...labelProps}>{label}</InputLabel>}

      <HiddenSelect {...hiddenSelectProps} />

      <SelectInput
        state={state}
        triggerRef={triggerRef}
        triggerProps={triggerProps}
        valueProps={valueProps}
        className={className}
        placeholder={placeholder}
        isValid={!invalid}
      />

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

export function useSelectControl<
  T extends object,
  M extends SelectSelectionMode = 'single',
>(
  props: AriaSelectProps<T, M>,
  triggerRef: React.RefObject<HTMLButtonElement | null>
): {
  state: SelectState<T, M>;
  labelProps: React.HTMLAttributes<HTMLElement>;
  triggerProps: AriaButtonProps;
  valueProps: React.HTMLAttributes<HTMLElement>;
} {
  const state = useSelectState<T, M>(props);
  const { labelProps, triggerProps, valueProps } = useSelect<T, M>(
    props,
    state,
    triggerRef
  );
  return { state, labelProps, triggerProps, valueProps };
}

export { Item };
export type { SelectState };
