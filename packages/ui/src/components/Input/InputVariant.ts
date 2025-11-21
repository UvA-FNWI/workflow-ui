import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'w-full rounded-md border px-3 py-1.5 text-base transition-all duration-200 outline-none',
  {
    variants: {
      isDisabled: {
        true: 'bg-grey-100 dark:bg-grey-800 cursor-not-allowed opacity-60',
        false: 'dark:bg-grey-900 bg-white',
      },
      isFocusVisible: {
        true: 'ring-navy-600 dark:ring-offset-grey-900 ring-2 ring-offset-2 dark:ring-orange-500',
        false: '',
      },
      isHovered: {
        true: 'border-navy-600 dark:border-sky-500',
        false: '',
      },
      isValid: {
        true: 'border-grey-300 dark:border-grey-600',
        false: 'border-red-600 dark:border-red-400',
      },
    },
    compoundVariants: [
      {
        isFocusVisible: true,
        isValid: true,
        class: 'border-navy-600 dark:border-sky-500',
      },
      {
        isFocusVisible: true,
        isValid: false,
        class: 'border-red-600 dark:border-red-400',
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
