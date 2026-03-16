import { cva } from 'class-variance-authority';

export const selectionVariants = cva(
  'ui:cursor-pointer ui:bg-grey-100 ui:transition-colors ui:duration-150 ui:outline-none ui:dark:bg-grey-900',
  {
    variants: {
      isSelected: {
        true: 'ui:bg-navy-600 ui:text-grey-100 ui:dark:bg-sky-500',
        false: 'ui:text-grey-900 ui:dark:text-white',
      },
      isHovered: {
        true: 'ui:bg-navy-100 ui:dark:bg-sky-900',
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
    compoundVariants: [
      {
        isHovered: true,
        isSelected: true,
        class: 'ui:bg-navy-700 ui:text-grey-100 ui:dark:bg-sky-600',
      },
      {
        isFocusVisible: true,
        isSelected: true,
        class: 'ui:ring-navy-800',
      },
    ],
    defaultVariants: {
      isDisabled: false,
      isFocusVisible: false,
      isHovered: false,
      isSelected: false,
    },
  }
);
