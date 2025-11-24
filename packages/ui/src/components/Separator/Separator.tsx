import { HTMLAttributes } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export type SeparatorVariantProps = VariantProps<typeof separatorVariants>;

const separatorVariants = cva('ui:bg-grey-300 ui:dark:bg-grey-600', {
  variants: {
    orientation: {
      horizontal: 'ui:h-[2px] ui:w-full',
      vertical: 'ui:h-full ui:w-[2px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export interface SeparatorProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {}

export const Separator = ({
  className = '',
  orientation = 'horizontal',
  ...otherProps
}: SeparatorProps) => {
  const finalOrientation = orientation || 'horizontal';
  return (
    <div
      className={cn(
        separatorVariants({ orientation: finalOrientation }),
        className
      )}
      role="separator"
      {...otherProps}
    />
  );
};
