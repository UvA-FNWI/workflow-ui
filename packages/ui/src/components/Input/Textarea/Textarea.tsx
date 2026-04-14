import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useTextField } from 'react-aria';

import { cn } from '../../../utils/cn';
import { InputLabel } from '../InputLabel';
import { type InputVariantProps, inputVariants } from '../InputVariant';

export interface TextareaProps
  extends Omit<
      React.ComponentPropsWithoutRef<'textarea'>,
      'onChange' | 'disabled'
    >,
    InputVariantProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  errorMessage?: string;
  isValid?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
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
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}) => {
  const fieldIsDisabled = isDisabled ?? false;
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
        isDisabled: fieldIsDisabled,
        validationState: isValid === false ? 'invalid' : 'valid',
        maxLength,
        inputElementType: 'textarea',
      },
      ref
    );

  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({
    isDisabled: fieldIsDisabled,
  });

  const textareaClasses = inputVariants({
    isDisabled: fieldIsDisabled,
    isFocusVisible,
    isHovered,
    isValid,
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
