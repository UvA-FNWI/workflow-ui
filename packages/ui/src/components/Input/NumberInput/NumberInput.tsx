import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useNumberField } from 'react-aria';
import { useNumberFieldState } from 'react-stately';

import { VariantProps } from 'class-variance-authority';

import { cn } from '../../../utils/cn';
import { inputVariants } from '../InputVariant';

export type NumberInputVariantProps = VariantProps<typeof inputVariants>;

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

  const inputClasses = inputVariants({
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
