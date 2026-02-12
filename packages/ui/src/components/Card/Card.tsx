import { HTMLAttributes, PropsWithChildren } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export type CardVariantProps = VariantProps<typeof cardVariants>;

const cardVariants = cva(
  'ui:overflow-hidden ui:rounded-lg ui:bg-white ui:transition-colors ui:dark:bg-grey-800',
  {
    variants: {
      padding: {
        none: 'ui:p-0',
        sm: 'ui:p-4',
        md: 'ui:p-6',
        lg: 'ui:p-8',
      },
      shadow: {
        none: 'ui:shadow-none',
        sm: 'ui:shadow-sm',
        md: 'ui:shadow-md',
        lg: 'ui:shadow-lg',
      },
      border: {
        none: 'ui:border-0',
        thin: 'ui:border ui:border-grey-200 ui:dark:border-grey-700',
        medium: 'ui:border-2 ui:border-grey-200 ui:dark:border-grey-700',
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
