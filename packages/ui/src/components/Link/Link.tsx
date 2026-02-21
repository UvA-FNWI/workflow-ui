import { AnchorHTMLAttributes, forwardRef, ReactNode } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const linkClassGenerator = cva(
  'ui:cursor-pointer ui:text-base ui:transition-colors ui:duration-150 ui:ease-in-out',
  {
    variants: {
      intent: {
        primary:
          'ui:text-black ui:hover:text-grey-800 ui:dark:text-white ui:dark:hover:text-grey-200',
        secondary:
          'ui:text-grey-700 ui:hover:text-black ui:dark:text-grey-300 ui:dark:hover:text-white',
        destructive:
          'ui:dark:ui:text-red-400 ui:text-red-600 ui:hover:text-red-800 ui:dark:hover:text-red-300',
      },
      underline: {
        true: 'ui:underline',
        false: '',
      },
    },
    defaultVariants: {
      intent: 'primary',
      underline: false,
    },
  }
);

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkClassGenerator> {
  children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, intent, underline, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(linkClassGenerator({ intent, underline }), className)}
        {...props}
      />
    );
  }
);

Link.displayName = 'Link';
