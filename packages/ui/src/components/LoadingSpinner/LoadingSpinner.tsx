import { HTMLAttributes } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const loadingSpinnerVariants = cva(
  'ui:rounded-full ui:animate-spin ui:border-solid ui:border-transparent ui:border-t-grey-900 ui:border-l-grey-900 ui:border-r-grey-900 ui:border-b-grey-300 ui:border-2',
  {
    variants: {
      size: {
        xs: 'ui:w-4 ui:h-4',
        sm: 'ui:w-6 ui:h-6',
        md: 'ui:w-8 ui:h-8',
        lg: 'ui:w-12 ui:h-12',
        xl: 'ui:w-16 ui:h-16',
        '2xl': 'ui:w-20 ui:h-20',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface LoadingSpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color'>,
    VariantProps<typeof loadingSpinnerVariants> {
  /**
   * Screen reader label for accessibility
   */
  label?: string;
}
const defaultLabel = 'Loading...'; // TODO: make default label customizable via i18n

export const LoadingSpinner = ({
  size,
  label = defaultLabel,
  className,
  style,
  ...otherProps
}: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(loadingSpinnerVariants({ size }), className)}
      role="status"
      aria-label={label}
      style={style}
      {...otherProps}
    >
      <span className="ui:sr-only">{label}</span>
    </div>
  );
};
