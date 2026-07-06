import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useTextField } from 'react-aria';

import { cn } from '../../utils/cn';
import { InputDescription } from './InputDescription';
import { InputError } from './InputError';
import { InputLabel } from './InputLabel';
import { type InputVariantProps, inputVariants } from './InputVariant';

export type { InputVariantProps };

export interface InputProps
  extends Omit<
      React.ComponentPropsWithoutRef<'input'>,
      'onChange' | 'disabled'
    >,
    InputVariantProps {
  isDisabled?: boolean;
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
  maxLength,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
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
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy,
        isDisabled,
        validationState: !isValid ? 'invalid' : 'valid',
        maxLength: maxLength,
      },
      ref
    );

  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({
    isDisabled,
  });

  const inputClasses = inputVariants({
    isDisabled,
    isFocusVisible,
    isHovered,
    isValid,
  });

  return (
    <div>
      {label && <InputLabel {...labelProps}>{label}</InputLabel>}
      <input
        {...mergeProps(inputProps, focusProps, hoverProps, rest)}
        ref={ref}
        className={cn(inputClasses, className)}
      />
      {description && (
        <InputDescription {...descriptionProps}>{description}</InputDescription>
      )}
      {errorMessage && !isValid && (
        <InputError {...errorMessageProps}>{errorMessage}</InputError>
      )}
    </div>
  );
};
