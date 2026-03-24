import { ReactNode } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const pillVariants = cva(
  'ui:inline-flex ui:h-5 ui:w-fit ui:min-w-5 ui:items-center ui:justify-center ui:rounded-full ui:px-3 ui:py-3 ui:text-xs ui:font-medium ui:transition-colors',
  {
    variants: {
      variant: {
        grey: 'ui:bg-grey-200 ui:text-grey-700 ui:dark:bg-grey-700 ui:dark:text-grey-400',
        red: 'ui:bg-red-100 ui:text-red-700 ui:dark:bg-red-700 ui:dark:text-red-100',
        green:
          'ui:bg-forest-200 ui:text-forest-800 ui:dark:bg-forest-800 ui:dark:text-forest-200',
        orange:
          'ui:bg-orange-100 ui:text-orange-700 ui:dark:bg-orange-700 ui:dark:text-orange-100',
        darkRed: 'ui:bg-red-700 ui:text-white ui:dark:bg-red-600',
      },
    },
    defaultVariants: {
      variant: 'darkRed',
    },
  }
);

export type PillVariantProps = VariantProps<typeof pillVariants>;

export interface PillProps extends PillVariantProps {
  /** The content of the pill (usually a number or short text) */
  children: ReactNode;
  /** Additional className for custom styling */
  className?: string;
}

/**
 * A small pill/badge component for displaying counts or short labels.
 */
export function Pill({ children, variant, className }: PillProps) {
  return (
    <span className={cn(pillVariants({ variant }), className)}>{children}</span>
  );
}
