import { HTMLAttributes } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const separatorVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'ui:h-[2px] ui:w-full',
      vertical: 'ui:h-full ui:w-[2px]',
    },
    weight: {
      bold: 'ui:bg-grey-700 ui:dark:bg-grey-400',
      normal: 'ui:bg-grey-300 ui:dark:bg-grey-600',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    weight: 'normal',
  },
});

export interface SeparatorProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {}

export const Separator = ({
  className = '',
  orientation = 'horizontal',
  weight = 'normal',
  ...otherProps
}: SeparatorProps) => {
  const variantClasses = separatorVariants({ orientation, weight });
  return (
    <div
      className={cn(variantClasses, className)}
      role="separator"
      {...otherProps}
    />
  );
};
