import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'ui:w-full ui:rounded-md ui:border ui:px-3 ui:py-1.5 ui:text-base ui:transition-all ui:duration-200 ui:outline-none',
  {
    variants: {
      isDisabled: {
        true: 'ui:bg-grey-100 ui:dark:bg-grey-800 ui:cursor-not-allowed ui:opacity-60',
        false: 'ui:dark:bg-grey-900 ui:bg-white',
      },
      isFocusVisible: {
        true: 'ui:ring-navy-600 ui:dark:ring-offset-grey-900 ui:ring-2 ui:ring-offset-2 ui:dark:ring-orange-500',
        false: '',
      },
      isHovered: {
        true: 'ui:border-navy-600 ui:dark:border-sky-500',
        false: '',
      },
      isValid: {
        true: 'ui:border-grey-300 ui:dark:border-grey-600',
        false: 'ui:border-red-600 ui:dark:border-red-400',
      },
    },
    compoundVariants: [
      {
        isFocusVisible: true,
        isValid: true,
        class: 'ui:border-navy-600 ui:dark:border-sky-500',
      },
      {
        isFocusVisible: true,
        isValid: false,
        class: 'ui:border-red-600 ui:dark:border-red-400',
      },
    ],
    defaultVariants: {
      isDisabled: false,
      isFocusVisible: false,
      isHovered: false,
      isValid: true,
    },
  }
);
