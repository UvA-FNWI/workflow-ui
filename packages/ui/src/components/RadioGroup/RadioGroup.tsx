import { createContext, useContext, useRef } from 'react';

import {
  mergeProps,
  useFocusRing,
  useHover,
  useRadio,
  useRadioGroup,
  VisuallyHidden,
} from 'react-aria';
import { RadioGroupState, useRadioGroupState } from 'react-stately';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { InputDescription } from '../Input/InputDescription';
import { InputError } from '../Input/InputError';
import { InputLabel } from '../Input/InputLabel';
import { Text } from '../Text/Text';

// Context for sharing RadioGroup state
const RadioGroupContext = createContext<RadioGroupState | null>(null);

// RadioGroup variants
const radioGroupVariants = cva('ui:flex ui:gap-2', {
  variants: {
    orientation: {
      horizontal: 'ui:flex-row ui:flex-wrap',
      vertical: 'ui:flex-col',
    },
    isDisabled: {
      true: 'ui:cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    isDisabled: false,
  },
});

// Radio item variants
const radioItemVariants = cva(
  'ui:inline-flex ui:cursor-pointer ui:items-center ui:gap-2 ui:select-none',
  {
    variants: {
      isDisabled: {
        true: 'ui:cursor-not-allowed',
        false: 'ui:cursor-pointer',
      },
      isFocusVisible: {
        true: 'ui:ring-2 ui:ring-navy-600 ui:ring-offset-6 ui:dark:ring-orange-600 ui:dark:ring-offset-grey-900',
        false: '',
      },
    },
    defaultVariants: {
      isDisabled: false,
      isFocusVisible: false,
    },
  }
);

// Radio circle variants
const radioCircleVariants = cva(
  'ui:relative ui:inline-flex ui:h-5 ui:w-5 ui:items-center ui:justify-center ui:rounded-full ui:border-2 ui:outline-6 ui:outline-transparent ui:transition-all ui:duration-200',
  {
    variants: {
      isSelected: {
        true: 'ui:border-navy-600 ui:dark:border-sky-500',
        false:
          'ui:border-grey-600 ui:bg-white ui:dark:border-grey-300 ui:dark:bg-grey-800',
      },
      isDisabled: {
        true: 'ui:border-grey-500 ui:bg-grey-100 ui:dark:border-grey-600 ui:dark:bg-grey-800',
        false: '',
      },
      isValid: {
        true: '',
        false: 'ui:border-red-600 ui:dark:border-red-400',
      },
      isHovered: {
        true: 'ui:bg-navy-600/10 ui:outline-6 ui:outline-navy-100 ui:dark:bg-sky-900 ui:dark:outline-sky-900',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        isDisabled: true,
        class: 'ui:border-grey-600',
      },
      {
        isHovered: true,
        isSelected: true,
        class:
          'ui:border-navy-600 ui:outline-navy-100 ui:dark:border-sky-500 ui:dark:outline-sky-900',
      },
      {
        isValid: false,
        isSelected: true,
        class: 'ui:border-red-600 ui:dark:border-red-400',
      },
    ],
    defaultVariants: {
      isSelected: false,
      isValid: true,
      isDisabled: false,
      isHovered: false,
    },
  }
);

// Inner dot variants
const radioInnerDotVariants = cva(
  'ui:absolute ui:h-3 ui:w-3 ui:rounded-full ui:transition-all ui:duration-200',
  {
    variants: {
      isSelected: {
        true: 'ui:scale-100 ui:bg-navy-600 ui:dark:bg-sky-500',
        false: 'ui:scale-0',
      },
      isDisabled: {
        true: 'ui:bg-grey-600',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        isDisabled: true,
        class: 'ui:bg-grey-600',
      },
    ],
    defaultVariants: {
      isSelected: false,
      isDisabled: false,
    },
  }
);

export type RadioGroupProps = {
  /** The label for the radio group */
  label?: string;
  /** Description text shown below the label */
  description?: string;
  /** Error message shown when invalid */
  errorMessage?: string;
  /** The currently selected value */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Whether the radio group is disabled */
  isDisabled?: boolean;
  /** Whether the radio group is valid */
  isValid?: boolean;
  /** The orientation of the radio items */
  orientation?: 'horizontal' | 'vertical';
  /** The name attribute for the radio group */
  name?: string;
  /** Children (Radio items) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
} & VariantProps<typeof radioGroupVariants>;

export type RadioProps = {
  /** The value of this radio option */
  value: string;
  /** The label for this radio option */
  children: React.ReactNode;
  /** Whether this radio option is disabled */
  isDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
};

/**
 * RadioGroup component for selecting one option from a set.
 * Uses react-aria for accessibility.
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  description,
  errorMessage,
  value,
  defaultValue,
  onChange,
  isDisabled = false,
  isValid = true,
  orientation = 'vertical',
  name,
  children,
  className,
}) => {
  const state = useRadioGroupState({
    value,
    defaultValue,
    onChange,
    isDisabled,
    validationState: !isValid ? 'invalid' : 'valid',
    name,
  });

  const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } =
    useRadioGroup(
      {
        label,
        description,
        errorMessage: !isValid ? errorMessage : undefined,
        isDisabled,
        validationState: !isValid ? 'invalid' : 'valid',
        orientation,
        name,
      },
      state
    );

  return (
    <div {...radioGroupProps} className="ui:flex ui:flex-col ui:gap-2">
      {label && <InputLabel {...labelProps}>{label}</InputLabel>}
      {description && (
        <InputDescription {...descriptionProps}>{description}</InputDescription>
      )}
      <RadioGroupContext.Provider value={state}>
        <div
          className={cn(
            radioGroupVariants({ orientation, isDisabled }),
            className
          )}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
      {errorMessage && !isValid && (
        <InputError {...errorMessageProps}>{errorMessage}</InputError>
      )}
    </div>
  );
};

/**
 * Radio component for individual radio options within a RadioGroup.
 */
export const Radio: React.FC<RadioProps> = ({
  value,
  children,
  isDisabled: isItemDisabled = false,
  className,
}) => {
  const state = useContext(RadioGroupContext);

  if (!state) {
    throw new Error('Radio must be used within a RadioGroup');
  }

  const ref = useRef<HTMLInputElement>(null);

  const isDisabled = state.isDisabled || isItemDisabled;
  const isSelected = state.selectedValue === value;

  const { inputProps, labelProps } = useRadio(
    {
      value,
      children,
      isDisabled,
    },
    state,
    ref
  );

  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });

  return (
    <label
      {...mergeProps(labelProps, hoverProps)}
      className={cn(
        radioItemVariants({
          isDisabled,
          isFocusVisible,
        }),
        className
      )}
    >
      <VisuallyHidden>
        <input {...mergeProps(inputProps, focusProps)} ref={ref} />
      </VisuallyHidden>
      <span
        className={cn(
          radioCircleVariants({
            isSelected,
            isDisabled,
            isValid: !state.isInvalid,
            isHovered: isHovered && !isDisabled,
          })
        )}
      >
        <span
          className={cn(
            radioInnerDotVariants({
              isSelected,
              isDisabled,
            })
          )}
        />
      </span>
      {children && (
        <Text intent={isDisabled ? 'secondary' : 'primary'}>{children}</Text>
      )}
    </label>
  );
};
