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
import { Text } from '../Text/Text';

const checkboxVariants = cva(
  // Base classes for the checkbox container
  'inline-flex items-center gap-2 cursor-pointer select-none',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed opacity-60',
        false: 'cursor-pointer',
      },
      isFocusVisible: {
        true: 'ring-2 ring-navy-600 ring-offset-6 dark:ring-offset-grey-900 dark:ring-orange-500',
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
  'relative inline-flex h-6 w-6 items-center justify-center rounded border-1 transition-all duration-200 outline-6 outline-transparent',
  {
    variants: {
      isSelected: {
        true: 'bg-navy-600 border-navy-600 dark:bg-sky-500 dark:border-sky-500',
        false: 'bg-white border-grey-300 dark:bg-grey-800 dark:border-grey-600',
      },
      isDisabled: {
        true: 'bg-grey-100 border-grey-300 dark:bg-grey-800 dark:border-grey-600',
        false: '',
      },
      isValid: {
        true: '',
        false: 'border-red-600 dark:border-red-400',
      },
      isHovered: {
        true: 'bg-navy-100 dark:bg-sky-900 outline-6 outline-navy-100 dark:outline-sky-900',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        isDisabled: true,
        class: 'bg-grey-600 border-grey-600',
      },
      {
        isHovered: true,
        isSelected: true,
        class:
          'bg-navy-600 dark:bg-sky-500 border-navy-600 dark:border-sky-500 outline-navy-100 dark:outline-sky-900',
      },
      {
        isValid: false,
        isSelected: true,
        class: 'bg-navy-600 border-navy-600',
      },
      {
        isSelected: false,
        isHovered: true,
        isDisabled: false,
        class: 'bg-navy-100 dark:bg-sky-900',
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

type CheckboxProps = {
  label: string;
  isSelected: boolean;
  isDisabled?: boolean;
  isValid?: boolean;
  onChange?: (value: boolean) => void;
} & Omit<React.ComponentPropsWithoutRef<'label'>, 'onChange'> &
  VariantProps<typeof checkboxVariants>;

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  isSelected,
  isDisabled,
  isValid,
  onChange,
  className,
  ...rest
}) => {
  const handleClick = () => {
    if (!isDisabled && onChange) {
      onChange(!isSelected);
    }
  };
  const state = useToggleState({
    isSelected,
    onChange: handleClick,
    isDisabled,
  });
  const ref = useRef<HTMLInputElement>(null);
  const { inputProps, labelProps } = useCheckbox(
    { children: label },
    state,
    ref
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });

  const checkboxClasses = checkboxVariants({
    isDisabled,
    isFocusVisible,
  });

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
        className={cn(
          checkboxBoxVariants({
            isSelected: state.isSelected,
            isDisabled,
            isValid,
            isHovered,
          })
        )}
        onClick={() => state.toggle()}
      >
        {state.isSelected && !isDisabled && (
          <svg
            className="h-6 w-6 text-white"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
          </svg>
        )}
      </span>
      {label && (
        <Text intent={isDisabled ? 'secondary' : 'primary'}>{label}</Text>
      )}
    </label>
  );
};
