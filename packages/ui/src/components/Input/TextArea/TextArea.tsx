import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useTextField } from 'react-aria';

import { cn } from '../../../utils/cn';
import { InputDescription } from '../InputDescription';
import { InputError } from '../InputError';
import { InputLabel } from '../InputLabel';
import { type InputVariantProps, inputVariants } from '../InputVariant';

export interface TextAreaProps
  extends Omit<
      React.ComponentPropsWithoutRef<'textarea'>,
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

export const TextArea: React.FC<TextAreaProps> = ({
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
  rows = 4,
  size,
  align,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
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
        maxLength,
        inputElementType: 'textarea',
      },
      ref
    );

  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({
    isDisabled,
  });

  const textareaClasses = inputVariants({
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
      <textarea
        {...mergeProps(inputProps, focusProps, hoverProps, rest)}
        ref={ref}
        rows={rows}
        className={cn(textareaClasses, 'ui:min-h-28 ui:resize-y', className)}
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
