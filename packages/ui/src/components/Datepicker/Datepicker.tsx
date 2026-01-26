import { useMemo, useRef } from 'react';

import {
  AriaDatePickerProps,
  DateValue,
  DismissButton,
  I18nProvider,
  useDatePicker,
} from 'react-aria';
import { useDatePickerState } from 'react-stately';

import { cn } from '../../utils/cn';
import { inputVariants } from '../Input/InputVariant';
import { Calendar } from './Calendar';
import { CalendarButton } from './CalendarButton';
import { DateField } from './DateField';
import { Popover } from './Popover';
import { dateToDateValue, dateValueToDate } from './utils';

// Public API that accepts Date objects
export interface DatePickerProps
  extends Omit<
    AriaDatePickerProps<DateValue>,
    'value' | 'defaultValue' | 'onChange'
  > {
  label?: string;
  description?: string;
  errorMessage?: string;
  isValid?: boolean;
  className?: string;
  locale?: string;
  value?: Date | DateValue | null;
  defaultValue?: Date | DateValue | null;
  onChange?: (date: Date | null) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  description,
  errorMessage,
  isValid = true,
  isDisabled = false,
  className,
  locale = 'nl-NL',
  value,
  defaultValue,
  onChange,
  ...props
}) => {
  // Convert Date to DateValue if needed
  const internalValue = useMemo(() => {
    if (!value) return undefined;
    return value instanceof Date ? dateToDateValue(value) : value;
  }, [value]);

  const internalDefaultValue = useMemo(() => {
    if (!defaultValue) return undefined;
    return defaultValue instanceof Date
      ? dateToDateValue(defaultValue)
      : defaultValue;
  }, [defaultValue]);

  // Wrap onChange to convert DateValue back to Date
  const handleChange = useMemo(() => {
    if (!onChange) return undefined;
    return (dateValue: DateValue | null) => {
      onChange(dateValueToDate(dateValue));
    };
  }, [onChange]);

  return (
    <I18nProvider locale={locale}>
      <DatePickerInner
        label={label}
        description={description}
        errorMessage={errorMessage}
        isValid={isValid}
        isDisabled={isDisabled}
        className={className}
        value={internalValue}
        defaultValue={internalDefaultValue}
        onChange={handleChange}
        {...props}
      />
    </I18nProvider>
  );
};

// Internal component that works with DateValue
interface DatePickerInnerProps
  extends Omit<
      DatePickerProps,
      'locale' | 'value' | 'defaultValue' | 'onChange'
    >,
    Pick<
      AriaDatePickerProps<DateValue>,
      'value' | 'defaultValue' | 'onChange'
    > {}

const DatePickerInner: React.FC<DatePickerInnerProps> = ({
  label,
  description,
  errorMessage,
  isValid = true,
  isDisabled = false,
  className,
  ...props
}) => {
  const state = useDatePickerState({
    ...props,
    isDisabled,
  });
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
        <CalendarButton {...buttonProps} isDisabled={isDisabled} />
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
