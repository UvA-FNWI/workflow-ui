import { useRef } from 'react';

import {
  mergeProps,
  useButton,
  useFocusRing,
  useHover,
  useNumberField,
} from 'react-aria';
import { useNumberFieldState } from 'react-stately';

import { VariantProps } from 'class-variance-authority';

import { cn } from '../../../utils/cn';
import { Button } from '../../Button/Button';
import { Icon } from '../../Icon';
import { InputDescription } from '../InputDescription';
import { InputError } from '../InputError';
import { InputLabel } from '../InputLabel';
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
  formatOptions?: Intl.NumberFormatOptions;
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
  formatOptions,
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
    formatOptions,
    description,
    errorMessage,
    validationState: !isValid ? 'invalid' : 'valid',
  });

  const ref = useRef<HTMLInputElement>(null);
  const incrementRef = useRef<HTMLButtonElement>(null);
  const decrementRef = useRef<HTMLButtonElement>(null);

  const {
    inputProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    incrementButtonProps,
    decrementButtonProps,
    groupProps,
  } = useNumberField(
    {
      label,
      description,
      errorMessage,
      minValue,
      maxValue,
      step,
      formatOptions,
      isDisabled: isDisabled ?? false,
      validationState: !isValid ? 'invalid' : 'valid',
    },
    state,
    ref
  );

  const { buttonProps: incrementProps } = useButton(
    incrementButtonProps,
    incrementRef
  );
  const { buttonProps: decrementProps } = useButton(
    decrementButtonProps,
    decrementRef
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
    <div className="ui:w-full">
      {label && <InputLabel {...labelProps}>{label}</InputLabel>}
      <div {...groupProps} className="ui:relative">
        <input
          {...mergeProps(rest, inputProps, focusProps, hoverProps)}
          ref={ref}
          // Reserve space on the right so large values don't run under the
          // absolutely-positioned increment/decrement buttons.
          className={cn(inputClasses, 'ui:pr-10', className)}
        />
        <div className="ui:absolute ui:top-0 ui:right-0 ui:flex ui:h-full ui:items-center">
          <div className="ui:flex ui:h-1/2 ui:flex-col ui:pr-2">
            <Button
              {...incrementProps}
              ref={incrementRef}
              type="button"
              intent="ghost"
              className="ui:px-0 ui:py-1"
            >
              <Icon name="chevron-up-small-solid" size="lg" aria-hidden />
            </Button>
            <Button
              {...decrementProps}
              ref={decrementRef}
              type="button"
              intent="ghost"
              className="ui:px-0 ui:py-1"
            >
              <Icon name="chevron-down-small-solid" size="lg" aria-hidden />
            </Button>
          </div>
        </div>
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
