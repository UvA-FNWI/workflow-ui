import { useRef } from 'react';

import {
  mergeProps,
  useCheckbox,
  useFocusRing,
  VisuallyHidden,
} from 'react-aria';
import { useToggleState } from 'react-stately';

import { cva, VariantProps } from 'class-variance-authority';

import { Text } from '../Text/Text';
import './Checkbox.scss';

const checkboxVariants = cva('Checkbox', {
  variants: {
    isSelected: {
      true: 'selected',
      false: '',
    },
    isDisabled: {
      true: 'disabled',
      false: '',
    },
    isValid: {
      true: '',
      false: 'invalid',
    },
    isFocusVisible: {
      true: 'focus-visible',
      false: '',
    },
  },
  defaultVariants: {
    isSelected: false,
    isValid: true,
    isDisabled: false,
    isFocusVisible: false,
  },
});

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

  const checkboxClasses = checkboxVariants({
    className,
    isSelected: state.isSelected,
    isDisabled,
    isValid,
    isFocusVisible,
  });

  return (
    <label
      {...labelProps}
      {...rest}
      className={checkboxClasses}
      style={{ ...labelProps.style, ...rest.style }}
    >
      <VisuallyHidden>
        <input {...mergeProps(inputProps, focusProps)} ref={ref} />
      </VisuallyHidden>
      <span className="checkbox" onClick={() => state.toggle()}>
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <polyline points="4,9 8,13 14,4" />
        </svg>
      </span>
      {label && (
        <Text intent={isDisabled ? 'secondary' : 'primary'}>{label}</Text>
      )}
    </label>
  );
};
