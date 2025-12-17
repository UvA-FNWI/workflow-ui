import { useRef } from 'react';

import {
  AriaDatePickerProps,
  DateValue,
  DismissButton,
  useButton,
  useDatePicker,
} from 'react-aria';
import { DatePickerState, useDatePickerState } from 'react-stately';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { inputVariants } from '../Input/InputVariant';
import { Calendar } from './Calendar';
import { DateField } from './DateField';
import { Popover } from './Popover';

export interface DatePickerProps extends AriaDatePickerProps<DateValue> {
  label?: string;
  description?: string;
  errorMessage?: string;
  isValid?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  description,
  errorMessage,
  isValid = true,
  isDisabled = false,
  className,
  ...props
}) => {
  const state = useDatePickerState({ ...props, isDisabled });
  const ref = useRef<HTMLDivElement>(null);
  const {
    groupProps,
    labelProps,
    fieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
    descriptionProps,
    errorMessageProps,
  } = useDatePicker({ ...props, label, isDisabled }, state, ref);

  const inputClasses = inputVariants({
    isDisabled,
    isFocusVisible: false,
    isHovered: false,
    isValid,
  });

  return (
    <div className="ui:w-full">
      {label && (
        <label
          {...labelProps}
          className="ui:mb-1 ui:block ui:text-sm ui:font-medium ui:text-black ui:dark:text-white"
        >
          {label}
        </label>
      )}
      <div
        {...groupProps}
        ref={ref}
        className={cn(
          inputClasses,
          'ui:flex ui:items-center ui:justify-between',
          className
        )}
      >
        <DateField {...fieldProps} />
        <CalendarButton
          {...buttonProps}
          isDisabled={isDisabled}
          state={state}
        />
      </div>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref as React.RefObject<HTMLElement>}>
          <DismissButton onDismiss={state.close} />
          <div {...dialogProps}>
            <Calendar {...calendarProps} />
          </div>
          <DismissButton onDismiss={state.close} />
        </Popover>
      )}
      {description && (
        <div
          {...descriptionProps}
          className="ui:mt-1 ui:text-sm ui:text-grey-600 ui:dark:text-grey-400"
        >
          {description}
        </div>
      )}
      {errorMessage && isValid === false && (
        <div
          {...errorMessageProps}
          className="ui:mt-1 ui:text-sm ui:text-red-600 ui:dark:text-red-400"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

interface CalendarButtonProps {
  isDisabled?: boolean;
  state: DatePickerState;
  [key: string]: unknown;
}

function CalendarButton(props: CalendarButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);

  return (
    // TODO: Replace with Button component
    <button
      {...buttonProps}
      ref={ref}
      className="ui:ml-2 ui:flex ui:h-6 ui:w-6 ui:items-center ui:justify-center ui:rounded ui:text-grey-600 ui:transition-colors ui:hover:text-navy-600 ui:dark:text-grey-400 ui:dark:hover:text-sky-500"
    >
      <Icon name="calendar-line" className="ui:h-5 ui:w-5" />
    </button>
  );
}
