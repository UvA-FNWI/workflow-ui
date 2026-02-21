import { HTMLAttributes } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const loadingSpinnerVariants = cva(
  'ui:animate-spin ui:rounded-full ui:border-2 ui:border-solid ui:border-transparent ui:border-t-grey-900 ui:border-r-grey-900 ui:border-b-grey-300 ui:border-l-grey-900',
  {
    variants: {
      size: {
        xs: 'ui:h-4 ui:w-4',
        sm: 'ui:h-6 ui:w-6',
        md: 'ui:h-8 ui:w-8',
        lg: 'ui:h-12 ui:w-12',
        xl: 'ui:h-16 ui:w-16',
        '2xl': 'ui:h-20 ui:w-20',
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
