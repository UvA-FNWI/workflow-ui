import { CSSProperties, useRef } from 'react';

import {
  AriaButtonProps,
  AriaComboBoxProps,
  AriaListBoxOptions,
  AriaPopoverProps,
  DismissButton,
  mergeProps,
  Overlay,
  useButton,
  useComboBox,
  useFilter,
  useFocusRing,
  useHover,
  useListBox,
  useOption,
  usePopover,
} from 'react-aria';
import { Item, useComboBoxState } from 'react-stately';
import type { ComboBoxState, Node } from 'react-stately';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { InputDescription } from '../Input/InputDescription';
import { InputError } from '../Input/InputError';
import { InputLabel } from '../Input/InputLabel';
import { inputVariants } from '../Input/InputVariant';
import { SelectedTags } from '../SelectedTags/SelectedTags';
import { selectionVariants } from './ComboBoxVariants';

type ComboBoxSelectionMode = 'single' | 'multiple';

interface ComboBoxPopoverProps<
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
> extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode;
  state: ComboBoxState<T, M>;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const ComboBoxPopover = <
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
>({
  children,
  state,
  popoverRef,
  triggerRef,
  ...props
}: ComboBoxPopoverProps<T, M>) => {
  const { popoverProps } = usePopover(
    {
      ...props,
      triggerRef,
      popoverRef,
      offset: 4,
      isNonModal: true,
    },
    state
  );

  const popoverStyle: CSSProperties = {
    ...popoverProps.style,
    width: triggerRef.current?.offsetWidth,
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

interface ComboBoxOptionProps<
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
> {
  item: Node<T>;
  state: ComboBoxState<T, M>;
}

const ComboBoxOption = <
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
>({
  item,
  state,
}: ComboBoxOptionProps<T, M>) => {
  const ref = useRef<HTMLLIElement>(null);
  const { optionProps, isSelected, isDisabled, isFocused } = useOption(
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
          isFocused,
        })
      )}
    >
      <span className="ui:flex-1 ui:truncate">{item.rendered}</span>
      {isSelected && <Icon name="checkmark-solid" size="sm" decorative />}
    </li>
  );
};

interface ComboBoxListBoxProps<
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
> extends AriaListBoxOptions<T> {
  state: ComboBoxState<T, M>;
  listBoxRef: React.RefObject<HTMLUListElement | null>;
  noResults?: string;
}

const ComboBoxListBox = <
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
>({
  state,
  listBoxRef,
  noResults = 'No results',
  ...props
}: ComboBoxListBoxProps<T, M>) => {
  const { listBoxProps } = useListBox(props, state, listBoxRef);

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      className="ui:max-h-64 ui:overflow-y-auto ui:rounded-xs ui:border ui:border-grey-300 ui:bg-grey-100 ui:p-1 ui:shadow-lg ui:outline-none ui:dark:border-grey-600 ui:dark:bg-grey-900"
    >
      {[...state.collection].map(item =>
        item.type === 'item' ? (
          <ComboBoxOption<T, M> key={item.key} item={item} state={state} />
        ) : null
      )}
      {state.collection.size === 0 && (
        <li
          className="ui:text-md ui:px-3 ui:py-2 ui:text-grey-600 ui:dark:text-grey-400"
          role="presentation"
        >
          {noResults}
        </li>
      )}
    </ul>
  );
};

interface ComboBoxInputProps<
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
> {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  fieldRef: React.RefObject<HTMLDivElement | null>;
  buttonProps: AriaButtonProps;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onOpen: () => void;
  className?: string;
  isDisabled?: boolean;
  isValid?: boolean;
  state: ComboBoxState<T, M>;
}

const ComboBoxInput = <
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
>({
  inputProps,
  inputRef,
  fieldRef,
  buttonProps,
  buttonRef,
  isOpen,
  onOpen,
  className,
  isDisabled,
  isValid,
  state,
}: ComboBoxInputProps<T, M>) => {
  const { focusProps, isFocusVisible } = useFocusRing();
  const { buttonProps: triggerProps } = useButton(buttonProps, buttonRef);
  const { hoverProps, isHovered } = useHover({
    isDisabled,
  });

  const fieldClasses = inputVariants({
    isDisabled,
    isFocusVisible,
    isHovered,
    isValid,
  });
  const isMultiple = state.selectionManager.selectionMode === 'multiple';

  const input = (
    <input
      {...mergeProps(inputProps, focusProps, {
        onPointerDown: (event: React.PointerEvent<HTMLInputElement>) => {
          if (isDisabled || event.button !== 0 || isOpen) return;
          onOpen();
        },
      })}
      ref={inputRef}
      className={cn(
        isMultiple
          ? 'ui:min-w-32 ui:flex-1 ui:border-0 ui:bg-transparent ui:p-0 ui:text-left ui:outline-none'
          : cn(fieldClasses, 'ui:pr-10', className),
        isMultiple && className
      )}
    />
  );

  return (
    <div ref={fieldRef} className="ui:relative">
      {isMultiple ? (
        <div
          {...hoverProps}
          className={cn(
            fieldClasses,
            'ui:flex ui:min-h-10 ui:flex-nowrap ui:items-center ui:gap-1.5 ui:overflow-hidden ui:pr-10',
            className
          )}
        >
          <SelectedTags
            items={state.selectedItems}
            isDisabled={isDisabled}
            className="ui:max-w-[70%] ui:flex-none"
            onRemove={key => {
              state.setValue(
                state.selectedItems.flatMap(selectedItem =>
                  selectedItem.key === key ? [] : [selectedItem.key]
                )
              );
              inputRef.current?.focus();
            }}
          />
          {input}
        </div>
      ) : (
        <div {...hoverProps}>{input}</div>
      )}
      <button
        {...mergeProps(triggerProps, {
          onClick: () => {
            inputRef.current?.focus();
            if (!isOpen) onOpen();
          },
        })}
        ref={buttonRef}
        type="button"
        disabled={isDisabled}
        className="ui:absolute ui:inset-y-0 ui:right-0 ui:flex ui:items-center ui:px-3 ui:outline-none"
      >
        <Icon
          name="chevron-down-small-line"
          size="sm"
          color="secondary"
          aria-hidden
          className={cn(
            'ui:shrink-0 ui:transition-transform ui:duration-200',
            isOpen && 'ui:rotate-180'
          )}
        />
      </button>
    </div>
  );
};

export interface ComboBoxProps<
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
> extends Omit<
  AriaComboBoxProps<T, M>,
  'children' | 'validationState' | 'label' | 'description' | 'errorMessage'
> {
  /** CSS class name for the combo box input */
  className?: string;
  /** Label shown above the combo box */
  label?: string;
  /** Description shown below the combo box */
  description?: string;
  /** Error text shown when invalid */
  errorMessage?: string;
  /** Marks the combo box as valid or invalid */
  isValid?: boolean;
  /** ComboBox options */
  children: AriaComboBoxProps<T, M>['children'];
  /** Shown in the list when filtering matches nothing */
  noResults?: string;
}

export function ComboBox<
  T extends object,
  M extends ComboBoxSelectionMode = 'single',
>(props: ComboBoxProps<T, M>) {
  const {
    className,
    label,
    description,
    errorMessage,
    isValid = true,
    isDisabled = false,
    placeholder,
    noResults,
    ...restProps
  } = props;

  const { contains } = useFilter({ sensitivity: 'base' });
  const state = useComboBoxState<T, M>({
    ...restProps,
    defaultFilter: contains,
    allowsEmptyCollection: true,
    menuTrigger: 'focus',
    isDisabled,
    isInvalid: !isValid,
    label,
    description,
    errorMessage,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listBoxRef = useRef<HTMLUListElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    labelProps,
    inputProps,
    buttonProps,
    listBoxProps,
    descriptionProps,
    errorMessageProps,
    isInvalid: isInvalidFromState,
  } = useComboBox<T, M>(
    {
      ...restProps,
      label,
      description,
      errorMessage,
      isDisabled,
      placeholder,
      isInvalid: !isValid,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state
  );
  const invalid = !isValid || isInvalidFromState;

  return (
    <div>
      {label && <InputLabel {...labelProps}>{label}</InputLabel>}

      <ComboBoxInput
        inputProps={inputProps}
        inputRef={inputRef}
        fieldRef={fieldRef}
        buttonProps={buttonProps}
        buttonRef={buttonRef}
        isOpen={state.isOpen}
        onOpen={() => state.open(null, 'manual')}
        className={className}
        isDisabled={isDisabled}
        isValid={!invalid}
        state={state}
      />

      {state.isOpen && (
        <ComboBoxPopover
          state={state}
          popoverRef={popoverRef}
          triggerRef={fieldRef as React.RefObject<HTMLElement>}
          placement="bottom start"
          shouldFlip
        >
          <DismissButton onDismiss={state.close} />
          <ComboBoxListBox<T, M>
            state={state}
            listBoxRef={listBoxRef}
            noResults={noResults}
            {...listBoxProps}
          />
          <DismissButton onDismiss={state.close} />
        </ComboBoxPopover>
      )}

      {description && (
        <InputDescription {...descriptionProps}>{description}</InputDescription>
      )}

      {errorMessage && invalid && (
        <InputError {...errorMessageProps}>{errorMessage}</InputError>
      )}
    </div>
  );
}

export { Item as ComboBoxItem };
