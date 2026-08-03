import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  'ui:w-full ui:rounded-xs ui:border ui:transition-all ui:duration-200 ui:outline-none ui:dark:text-white',
  {
    variants: {
      isDisabled: {
        true: 'ui:cursor-not-allowed ui:bg-grey-400 ui:opacity-60 ui:dark:border-grey-700 ui:dark:bg-grey-700',
        false: 'ui:bg-grey-100 ui:dark:bg-grey-900',
      },
      isFocusVisible: {
        true: 'ui:ring-2 ui:ring-navy-600 ui:ring-offset-2 ui:dark:ring-orange-500 ui:dark:ring-offset-grey-900',
        false: '',
      },
      isHovered: {
        true: 'ui:border-navy-600 ui:dark:border-sky-500',
        false: '',
      },
      isValid: {
        true: 'ui:border-grey-600 ui:dark:border-grey-400',
        false: 'ui:border-red-600 ui:dark:border-red-400',
      },
      size: {
        sm: 'ui:min-h-6 ui:px-2 ui:py-1 ui:text-xs',
        md: 'ui:min-h-8 ui:px-3 ui:py-1.5 ui:text-sm',
        lg: 'ui:min-h-10 ui:px-3 ui:py-2 ui:text-base',
      },
      align: {
        left: 'ui:text-left',
        center: 'ui:text-center',
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
      size: 'lg',
      align: 'left',
    },
  }
);

export type InputVariantProps = VariantProps<typeof inputVariants>;
