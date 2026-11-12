import { useRef } from 'react';

import {
  mergeProps,
  useCheckbox,
  useFocusRing,
  useHover,
  VisuallyHidden,
} from 'react-aria';
import { useToggleState } from 'react-stately';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { devWarning } from '../../utils/devWarning';
import { Text } from '../Text/Text';

const checkboxVariants = cva(
  // Base classes for the checkbox container
  'ui:relative ui:inline-flex ui:cursor-pointer ui:items-start ui:gap-2 ui:select-none',
  {
    variants: {
      isDisabled: {
        true: 'ui:cursor-not-allowed ui:opacity-60',
        false: 'ui:cursor-pointer',
      },
      isFocusVisible: {
        true: 'ui:ring-2 ui:ring-navy-600 ui:ring-offset-6 ui:dark:ring-orange-500 ui:dark:ring-offset-grey-900',
        false: '',
      },
    },
    defaultVariants: {
      isDisabled: false,
      isFocusVisible: false,
    },
  }
);

const checkboxBoxVariants = cva(
  // Base checkbox box styles
  'ui:relative ui:inline-flex ui:h-6 ui:w-6 ui:min-w-6 ui:shrink-0 ui:items-center ui:justify-center ui:rounded ui:border-1 ui:outline-6 ui:outline-transparent ui:transition-all ui:duration-200',
  {
    variants: {
      isSelected: {
        true: 'ui:border-navy-600 ui:bg-navy-600 ui:dark:border-sky-500 ui:dark:bg-sky-500',
        false:
          'ui:border-grey-600 ui:bg-white ui:dark:border-grey-600 ui:dark:bg-grey-800',
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
        true: 'ui:bg-navy-100 ui:outline-6 ui:outline-navy-100 ui:dark:bg-sky-900 ui:dark:outline-sky-900',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        isDisabled: true,
        class: 'ui:border-grey-600 ui:bg-grey-600',
      },
      {
        isHovered: true,
        isSelected: true,
        class:
          'ui:border-navy-600 ui:bg-navy-600 ui:outline-navy-100 ui:dark:border-sky-500 ui:dark:bg-sky-500 ui:dark:outline-sky-900',
      },
      {
        isValid: false,
        isSelected: true,
        class: 'ui:border-navy-600 ui:bg-navy-600',
      },
      {
        isSelected: false,
        isHovered: true,
        isDisabled: false,
        class: 'ui:bg-navy-100 ui:dark:bg-sky-900',
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

type CheckboxAriaProps = {
  /** Accessible name when there is no visible label */
  'aria-label'?: string;
  /** Id(s) of element(s) that label the checkbox */
  'aria-labelledby'?: string;
  /** Id(s) of element(s) that describe the checkbox */
  'aria-describedby'?: string;
};

type CheckboxProps = {
  /**
   * Visible label. Optional when `aria-label` or `aria-labelledby` is given,
   * e.g. for row-selection checkboxes in a table.
   */
  label?: string;
  isSelected: boolean;
  /** Mixed state, e.g. for a "select all" checkbox when some rows are selected */
  isIndeterminate?: boolean;
  isDisabled?: boolean;
  isValid?: boolean;
  onChange?: (value: boolean) => void;
  /** Id for the native input, so an external `<label htmlFor>` can be used */
  id?: string;
} & CheckboxAriaProps &
  Omit<
    React.ComponentPropsWithoutRef<'label'>,
    'onChange' | 'id' | keyof CheckboxAriaProps
  > &
  VariantProps<typeof checkboxVariants>;

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  isSelected,
  isIndeterminate,
  isDisabled,
  isValid,
  onChange,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...rest
}) => {
  if (!label && !ariaLabel && !ariaLabelledBy && !id) {
    devWarning(
      'Checkbox needs a label, aria-label, aria-labelledby or an id referenced by an external <label>.'
    );
  }

  const handleChange = () => {
    if (!isDisabled && onChange) {
      onChange(!isSelected);
    }
  };
  const state = useToggleState({
    isSelected,
    onChange: handleChange,
    isDisabled,
  });
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, labelProps } = useCheckbox(
    {
      children: label,
      id,
      isIndeterminate,
      isDisabled,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
    },
    state,
    ref
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });

  const checkboxClasses = checkboxVariants({
    isDisabled,
    isFocusVisible,
  });

  const showFilled = state.isSelected || !!isIndeterminate;

  return (
    <label
      {...labelProps}
      {...rest}
      className={cn(checkboxClasses, className)}
      style={{ ...labelProps.style, ...rest.style }}
    >
      <VisuallyHidden>
        <input {...mergeProps(inputProps, focusProps)} ref={ref} />
      </VisuallyHidden>
      <span
        {...hoverProps}
        aria-hidden="true"
        className={cn(
          checkboxBoxVariants({
            isSelected: showFilled,
            isDisabled,
            isValid,
            isHovered,
          })
        )}
      >
        {isIndeterminate ? (
          <svg
            className="ui:h-6 ui:w-6 ui:text-white"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <rect x="3.5" y="7.25" width="9" height="1.5" rx="0.75" />
          </svg>
        ) : (
          state.isSelected && (
            <svg
              className="ui:h-6 ui:w-6 ui:text-white"
              fill="currentColor"
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
            </svg>
          )
        )}
      </span>
      {label && (
        <Text
          intent={isDisabled ? 'secondary' : 'primary'}
          className="ui:leading-6"
        >
          {label}
        </Text>
      )}
    </label>
  );
};
