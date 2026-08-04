import { useRef } from 'react';

import { mergeProps, useFocusRing, useHover, useSearchField } from 'react-aria';
import { useSearchFieldState } from 'react-stately';

import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../../utils/cn';
import { Icon } from '../../Icon';
import { InputDescription } from '../InputDescription';
import { InputError } from '../InputError';
import { InputLabel } from '../InputLabel';
import { inputVariants } from '../InputVariant';

export type SearchInputVariantProps = VariantProps<typeof inputVariants>;

export interface SearchInputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'size'>,
    SearchInputVariantProps {
  value?: string;
  defaultValue?: string;
  type?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  errorMessage?: string;
  isValid?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  defaultValue,
  onChange,
  label,
  description,
  errorMessage,
  isValid = true,
  isDisabled = false,
  className,
  size,
  align,
  ...rest
}) => {
  const state = useSearchFieldState({
    value,
    defaultValue,
    onChange,
    isDisabled: isDisabled ?? false,
    label,
    description,
    errorMessage,
    validationState: isValid ? 'valid' : 'invalid',
  });

  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, labelProps, descriptionProps, errorMessageProps } =
    useSearchField(
      {
        label,
        description,
        errorMessage,
        isDisabled: isDisabled ?? false,
        validationState: isValid ? 'valid' : 'invalid',
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
    size,
    align,
  });

  return (
    <div>
      {label && <InputLabel {...labelProps}>{label}</InputLabel>}
      <div className="ui:relative">
        <input
          {...mergeProps(inputProps, focusProps, hoverProps, rest)}
          ref={ref}
          className={cn(inputClasses, className, 'ui:pr-12')}
          type="text"
        />
        <div className="ui:pointer-events-none ui:absolute ui:top-0 ui:right-0 ui:flex ui:h-full ui:items-center">
          <div className="ui:h-1/2 ui:w-px ui:bg-grey-600" />
          <div className="ui:px-2">
            <Icon name="search-line" size="md" color="primary" />
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
