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
  locale?: string;
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
  locale = 'en-US',
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
    locale,
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
    <div className="ui:w-full">
      {label && (
        <label
          {...labelProps}
          className="ui:mb-1 ui:block ui:text-sm ui:font-medium ui:text-black ui:dark:text-white"
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
