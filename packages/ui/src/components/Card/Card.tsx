import { HTMLAttributes, PropsWithChildren } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export type CardVariantProps = VariantProps<typeof cardVariants>;

const cardVariants = cva(
  'dark:bg-grey-800 rounded-lg bg-white transition-colors',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
      border: {
        none: 'border-0',
        thin: 'border-grey-200 dark:border-grey-700 border',
        medium: 'border-grey-200 dark:border-grey-700 border-2',
      },
    },
    defaultVariants: {
      padding: 'md',
      shadow: 'sm',
      border: 'thin',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = ({
  children,
  className = '',
  padding,
  shadow,
  border,
  ...otherProps
}: PropsWithChildren<CardProps>) => {
  return (
    <div
      className={cn(
        cardVariants({
          padding,
          shadow,
          border,
        }),
        className
      )}
      {...otherProps}
    >
      {children}
    </div>
  );
};
