import { ReactNode } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const pillVariants = cva(
  'ui:inline-flex ui:items-center ui:justify-center ui:min-w-5 ui:h-5 ui:px-1.5 ui:text-xs ui:font-medium ui:rounded-full ui:transition-colors',
  {
    variants: {
      variant: {
        grey: 'ui:bg-grey-200 ui:text-grey-600 ui:dark:bg-grey-700 ui:dark:text-grey-400',
        red: 'ui:bg-red-700 ui:text-white ui:dark:bg-red-600',
      },
    },
    defaultVariants: {
      variant: 'red',
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
