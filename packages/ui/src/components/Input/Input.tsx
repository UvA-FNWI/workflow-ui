import { type ReactNode, useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useTextField } from 'react-aria';

import { cn } from '../../utils/cn';
import { InputDescription } from './InputDescription';
import { InputError } from './InputError';
import { InputLabel } from './InputLabel';
import { type InputVariantProps, inputVariants } from './InputVariant';

export type { InputVariantProps };

export interface InputProps
  extends
    Omit<
      React.ComponentPropsWithoutRef<'input'>,
      'onChange' | 'disabled' | 'size'
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
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
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
  leftIcon,
  rightIcon,
  size,
  align,
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
    size,
    align,
  });

  return (
    <div>
      {label && <InputLabel {...labelProps}>{label}</InputLabel>}
      <div className="ui:relative">
        {leftIcon && (
          <div className="ui:pointer-events-none ui:absolute ui:top-0 ui:left-0 ui:flex ui:h-full ui:items-center">
            <div className="ui:pr-2 ui:pl-3 ui:text-grey-600">{leftIcon}</div>
          </div>
        )}
        <input
          {...mergeProps(inputProps, focusProps, hoverProps, rest)}
          ref={ref}
          className={cn(
            inputClasses,
            // Gutters are calibrated for the lg size and don't shrink for size="sm"/"md".
            leftIcon && 'ui:pl-10',
            rightIcon && 'ui:pr-10',
            className
          )}
        />
        {rightIcon && (
          <div className="ui:pointer-events-none ui:absolute ui:top-0 ui:right-0 ui:flex ui:h-full ui:items-center">
            <div className="ui:pr-3 ui:pl-2 ui:text-grey-600">{rightIcon}</div>
          </div>
        )}
      </div>
      {description && (
        <InputDescription {...descriptionProps}>{description}</InputDescription>
      )}
      {errorMessage && !isValid && (
        <InputError {...errorMessageProps}>{errorMessage}</InputError>
      )}
    </div>
  );
};
