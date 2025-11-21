import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useTextField } from 'react-aria';

import { VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { inputVariants } from './InputVariant';

export type InputVariantProps = VariantProps<typeof inputVariants>;

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'>,
    InputVariantProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  errorMessage?: string;
  isValid?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  defaultValue,
  onChange,
  label,
  description,
  errorMessage,
  isValid = true,
  isDisabled = false,
  className,
  ...rest
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, labelProps, descriptionProps, errorMessageProps } =
    useTextField(
      {
        value,
        defaultValue,
        onChange,
        label,
        description,
        errorMessage,
        isDisabled: isDisabled ?? false,
        validationState: isValid === false ? 'invalid' : 'valid',
      },
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
