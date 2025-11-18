import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useNumberField } from 'react-aria';
import { useNumberFieldState } from 'react-stately';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const numberInputVariants = cva(
  'w-full rounded-md border px-3 py-1.5 text-base transition-all duration-200 outline-none',
  {
    variants: {
      isDisabled: {
        true: 'bg-grey-100 dark:bg-grey-800 cursor-not-allowed opacity-60',
        false: 'dark:bg-grey-900 bg-white',
      },
      isFocusVisible: {
        true: 'ring-navy-600 dark:ring-offset-grey-900 ring-2 ring-offset-2 dark:ring-orange-500',
        false: '',
      },
      isHovered: {
        true: 'border-navy-600 dark:border-sky-500',
        false: '',
      },
      isValid: {
        true: 'border-grey-300 dark:border-grey-600',
        false: 'border-red-600 dark:border-red-400',
      },
    },
    compoundVariants: [
      {
        isFocusVisible: true,
        isValid: true,
        class: 'border-navy-600 dark:border-sky-500',
      },
      {
        isFocusVisible: true,
        isValid: false,
        class: 'border-red-600 dark:border-red-400',
      },
    ],
    defaultVariants: {
      isDisabled: false,
      isFocusVisible: false,
      isHovered: false,
      isValid: true,
    },
  }
);

export type NumberInputVariantProps = VariantProps<typeof numberInputVariants>;

export interface NumberInputProps
  extends Omit<
      React.ComponentPropsWithoutRef<'input'>,
      'onChange' | 'value' | 'defaultValue' | 'type'
    >,
    NumberInputVariantProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | undefined) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  label?: string;
  description?: string;
  errorMessage?: string;
  isValid?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  step,
  label,
  description,
  errorMessage,
  isValid = true,
  isDisabled = false,
  className,
  ...rest
}) => {
  const state = useNumberFieldState({
    value,
    defaultValue,
    onChange,
    minValue,
    maxValue,
    step,
    isDisabled: isDisabled ?? false,
    label,
    locale: 'en-US',
    description,
    errorMessage,
    validationState: isValid === false ? 'invalid' : 'valid',
  });

  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, labelProps, descriptionProps, errorMessageProps } =
    useNumberField(
      {
        label,
        description,
        errorMessage,
        minValue,
        maxValue,
        step,
        isDisabled: isDisabled ?? false,
        validationState: isValid === false ? 'invalid' : 'valid',
      },
      state,
      ref
    );

  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({
    isDisabled: isDisabled ?? false,
  });

  const inputClasses = numberInputVariants({
    isDisabled,
    isFocusVisible,
    isHovered,
    isValid,
  });

  // TODO: Add buttons for increment and decrement via react-aria
  return (
    <div className="w-full">
      {label && (
        <label
          {...labelProps}
          className="mb-1 block text-sm font-medium text-black dark:text-white"
        >
          {label}
        </label>
      )}
      <input
        {...mergeProps(inputProps, focusProps, hoverProps, rest)}
        ref={ref}
        className={cn(inputClasses, className)}
      />
      {description && (
        <div
          {...descriptionProps}
          className="text-grey-600 dark:text-grey-400 mt-1 text-sm"
        >
          {description}
        </div>
      )}
      {errorMessage && isValid === false && (
        <div
          {...errorMessageProps}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};
