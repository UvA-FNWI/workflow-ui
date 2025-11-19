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
  'ui:inline-flex ui:cursor-pointer ui:items-center ui:gap-2 ui:select-none',
  {
    variants: {
      isDisabled: {
        true: 'ui:cursor-not-allowed ui:opacity-60',
        false: 'ui:cursor-pointer',
      },
      isFocusVisible: {
        true: 'ui:ring-navy-600 ui:dark:ring-offset-grey-900 ui:ring-2 ui:ring-offset-6 ui:dark:ring-orange-500',
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
  'ui:relative ui:inline-flex ui:h-6 ui:w-6 ui:items-center ui:justify-center ui:rounded ui:transition-all ui:duration-200 border-1 outline-6 outline-transparent',
  {
    variants: {
      isSelected: {
        true: 'ui:bg-navy-600 ui:border-navy-600 ui:dark:border-sky-500 ui:dark:bg-sky-500',
        false:
          'ui:border-grey-300 ui:dark:bg-grey-800 ui:dark:border-grey-600 ui:bg-white',
      },
      isDisabled: {
        true: 'ui:bg-grey-100 ui:border-grey-300 ui:dark:bg-grey-800 ui:dark:border-grey-600',
        false: '',
      },
      isValid: {
        true: '',
        false: 'ui:border-red-600 ui:dark:border-red-400',
      },
      isHovered: {
        true: 'ui:bg-navy-100 ui:outline-navy-100 ui:outline-6 ui:dark:bg-sky-900 ui:dark:outline-sky-900',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        isDisabled: true,
        class: 'ui:bg-grey-600 ui:border-grey-600',
      },
      {
        isHovered: true,
        isSelected: true,
        class:
          'ui:bg-navy-600 ui:border-navy-600 ui:outline-navy-100 ui:dark:border-sky-500 ui:dark:bg-sky-500 ui:dark:outline-sky-900',
      },
      {
        isValid: false,
        isSelected: true,
        class: 'ui:bg-navy-600 ui:border-navy-600',
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
            className="ui:h-6 ui:w-6 ui:text-white"
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
