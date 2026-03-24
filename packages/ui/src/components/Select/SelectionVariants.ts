import { cva } from 'class-variance-authority';

export const selectionVariants = cva(
  'ui:cursor-pointer ui:bg-white ui:transition-colors ui:duration-150 ui:outline-none ui:dark:bg-grey-900',
  {
    variants: {
      isSelected: {
        true: 'ui:bg-grey-300 ui:dark:bg-grey-700',
        false: 'ui:text-grey-900 ui:dark:text-white',
      },
      isHovered: {
        true: 'ui:bg-grey-300 ui:dark:bg-grey-700',
        false: undefined,
      },
      isDisabled: {
        true: 'ui:cursor-not-allowed ui:bg-grey-100 ui:opacity-60 ui:dark:bg-grey-800',
        false: undefined,
      },
      isFocusVisible: {
        true: 'ui:ring-2 ui:ring-navy-600 ui:ring-inset ui:dark:ring-orange-500',
        false: undefined,
      },
    },
    defaultVariants: {
      isDisabled: false,
      isFocusVisible: false,
      isHovered: false,
      isSelected: false,
    },
  }
);
