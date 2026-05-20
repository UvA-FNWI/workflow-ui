import { cva } from 'class-variance-authority';

export const selectionVariants = cva(
  'ui:cursor-pointer ui:transition-colors ui:duration-150 ui:outline-none',
  {
    variants: {
      intent: {
        default:
          'ui:bg-white ui:text-grey-900 ui:dark:bg-grey-900 ui:dark:text-white',
        danger: 'ui:bg-red-600 ui:text-white',
      },
      isSelected: {
        true: undefined,
        false: undefined,
      },
      isHovered: {
        true: undefined,
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
        intent: 'default',
        isSelected: true,
        className: 'ui:bg-grey-300 ui:dark:bg-grey-700',
      },
      {
        intent: 'danger',
        isSelected: true,
        className: 'ui:bg-black',
      },
      {
        intent: 'default',
        isHovered: true,
        className: 'ui:bg-grey-300 ui:dark:bg-grey-700',
      },
      {
        intent: 'danger',
        isHovered: true,
        className: 'ui:bg-red-700',
      },
    ],
    defaultVariants: {
      intent: 'default',
      isDisabled: false,
      isFocusVisible: false,
      isHovered: false,
      isSelected: false,
    },
  }
);
