import { useMemo, useRef } from 'react';

import {
  AriaDateRangePickerProps,
  DateValue,
  DismissButton,
  I18nProvider,
  useDateRangePicker,
} from 'react-aria';
import { useDateRangePickerState } from 'react-stately';

import { cn } from '../../utils/cn';
import { inputVariants } from '../Input/InputVariant';
import { RangeCalendar } from './Calendar';
import { CalendarButton } from './CalendarButton';
import { DateField } from './DateField';
import { Popover } from './Popover';
import {
  DateRange,
  dateRangeToDateValueRange,
  dateValueRangeToDateRange,
} from './utils';

// Re-export DateRange type for consumers
export type { DateRange } from './utils';

// Public API that accepts Date objects
export interface DateRangePickerProps
  extends Omit<
    AriaDateRangePickerProps<DateValue>,
    'value' | 'defaultValue' | 'onChange'
  > {
  label?: string;
  description?: string;
  errorMessage?: string;
  isValid?: boolean;
  className?: string;
  locale?: string;
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (range: DateRange | null) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
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
  // Convert Date range to DateValue range if needed
  const internalValue = useMemo(() => {
    if (!value) return undefined;
    return dateRangeToDateValueRange(value) ?? undefined;
  }, [value]);

  const internalDefaultValue = useMemo(() => {
    if (!defaultValue) return undefined;
    return dateRangeToDateValueRange(defaultValue) ?? undefined;
  }, [defaultValue]);

  // Wrap onChange to convert DateValue range back to Date range
  const handleChange = useMemo(() => {
    if (!onChange) return undefined;
    return (range: { start: DateValue; end: DateValue } | null) => {
      onChange(dateValueRangeToDateRange(range));
    };
  }, [onChange]);

  return (
    <I18nProvider locale={locale}>
      <DateRangePickerInner
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
interface DateRangePickerInnerProps
  extends Omit<
      DateRangePickerProps,
      'locale' | 'value' | 'defaultValue' | 'onChange'
    >,
    Pick<
      AriaDateRangePickerProps<DateValue>,
      'value' | 'defaultValue' | 'onChange'
    > {}

const DateRangePickerInner: React.FC<DateRangePickerInnerProps> = ({
  label,
  description,
  errorMessage,
  isValid = true,
  isDisabled = false,
  className,
  ...props
}) => {
  const state = useDateRangePickerState({
    ...props,
    isDisabled,
  });
  const ref = useRef<HTMLDivElement>(null);
  const {
    groupProps,
    labelProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
    descriptionProps,
    errorMessageProps,
  } = useDateRangePicker({ ...props, label, isDisabled }, state, ref);

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
          'ui:flex ui:items-center ui:justify-between ui:gap-2',
          className
        )}
      >
        <div className="ui:flex ui:flex-1 ui:items-center ui:gap-2">
          <div className="ui:flex ui:flex-col ui:gap-0.5">
            <DateField {...startFieldProps} />
          </div>
          <span className="ui:mt-auto ui:text-grey-400 ui:dark:text-grey-600">
            –
          </span>
          <div className="ui:flex ui:flex-col ui:gap-0.5">
            <DateField {...endFieldProps} />
          </div>
        </div>
        <CalendarButton {...buttonProps} isDisabled={isDisabled} />
      </div>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref as React.RefObject<HTMLElement>}>
          <DismissButton onDismiss={state.close} />
          <div {...dialogProps}>
            <RangeCalendar {...calendarProps} />
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
