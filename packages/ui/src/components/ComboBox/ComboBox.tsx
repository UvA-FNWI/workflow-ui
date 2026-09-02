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
import { selectionVariants } from './ComboBoxVariants';

interface ComboBoxPopoverProps<T extends object>
  extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode;
  state: ComboBoxState<T>;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const ComboBoxPopover = <T extends object>({
  children,
  state,
  popoverRef,
  triggerRef,
  ...props
}: ComboBoxPopoverProps<T>) => {
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

interface ComboBoxOptionProps<T extends object> {
  item: Node<T>;
  state: ComboBoxState<T>;
}

const ComboBoxOption = <T extends object>({
  item,
  state,
}: ComboBoxOptionProps<T>) => {
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

interface ComboBoxListBoxProps<T extends object> extends AriaListBoxOptions<T> {
  state: ComboBoxState<T>;
  listBoxRef: React.RefObject<HTMLUListElement | null>;
  noResults?: string;
}

const ComboBoxListBox = <T extends object>({
  state,
  listBoxRef,
  noResults = 'No results',
  ...props
}: ComboBoxListBoxProps<T>) => {
  const { listBoxProps } = useListBox(props, state, listBoxRef);

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      className="ui:max-h-64 ui:overflow-y-auto ui:rounded-xs ui:border ui:border-grey-300 ui:bg-grey-100 ui:p-1 ui:shadow-lg ui:outline-none ui:dark:border-grey-600 ui:dark:bg-grey-900"
    >
      {[...state.collection].map(item =>
        item.type === 'item' ? (
          <ComboBoxOption key={item.key} item={item} state={state} />
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

interface ComboBoxInputProps {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  buttonProps: AriaButtonProps;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onOpen: () => void;
  className?: string;
  isDisabled?: boolean;
  isValid?: boolean;
}

const ComboBoxInput = ({
  inputProps,
  inputRef,
  buttonProps,
  buttonRef,
  isOpen,
  onOpen,
  className,
  isDisabled,
  isValid,
}: ComboBoxInputProps) => {
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

  return (
    <div className="ui:relative">
      <input
        {...mergeProps(inputProps, focusProps, hoverProps, {
          onPointerDown: (event: React.PointerEvent<HTMLInputElement>) => {
            if (isDisabled || event.button !== 0 || isOpen) return;
            onOpen();
          },
        })}
        ref={inputRef}
        className={cn(fieldClasses, 'ui:pr-10', className)}
      />
      <button
        {...triggerProps}
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

export interface ComboBoxProps<T extends object>
  extends Omit<
    AriaComboBoxProps<T>,
    | 'children'
    | 'validationState'
    | 'label'
    | 'description'
    | 'errorMessage'
    | 'selectionMode'
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
  children: AriaComboBoxProps<T>['children'];
  /** Shown in the list when filtering matches nothing */
  noResults?: string;
}

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
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
  const state = useComboBoxState<T>({
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
  } = useComboBox(
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
        buttonProps={buttonProps}
        buttonRef={buttonRef}
        isOpen={state.isOpen}
        onOpen={() => state.open(null, 'manual')}
        className={className}
        isDisabled={isDisabled}
        isValid={!invalid}
      />

      {state.isOpen && (
        <ComboBoxPopover
          state={state}
          popoverRef={popoverRef}
          triggerRef={inputRef as React.RefObject<HTMLElement>}
          placement="bottom start"
          shouldFlip
        >
          <DismissButton onDismiss={state.close} />
          <ComboBoxListBox
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
