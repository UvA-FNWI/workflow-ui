import React, { PropsWithChildren, ReactNode } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { Icon } from '../..';
import { cn } from '../../utils/cn';

export type PillAvailableColors =
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'grey';

const pillClassGenerator = cva(
  // Base styles
  'ui:inline-flex ui:justify-center ui:items-center ui:px-3 ui:py-1 ui:whitespace-nowrap ui:font-normal',
  {
    variants: {
      type: {
        error: 'ui:bg-red-600 ui:text-white',
        warning: 'ui:bg-orange-500 ui:text-black',
        info: 'ui:bg-grey-300 ui:text-black',
      },
      shape: {
        circular: 'ui:rounded-full',
        square: 'ui:rounded-md',
      },
      color: {
        red: 'ui:bg-red-200 ui:text-black',
        yellow: 'ui:bg-lime-200 ui:text-black',
        green: 'ui:bg-forest-200 ui:text-black',
        blue: 'ui:bg-navy-200 ui:text-black',
        purple: 'ui:bg-purple-200 ui:text-black',
        grey: 'ui:bg-grey-300 ui:text-black',
      },
    },
    defaultVariants: {
      type: 'info',
      shape: 'circular',
    },
  }
);

type PillVariantProps = VariantProps<typeof pillClassGenerator>;
export interface PillProps extends PropsWithChildren, PillVariantProps {
  icon?: ReactNode;
  className?: string;
  tag?: string;
}

export const Pill: React.FC<PillProps> = ({
  children,
  type,
  shape,
  color,
  icon,
  className,
  tag,
}) => {
  const defaultIcon =
    type === 'error' || type === 'warning' ? (
      <Icon name="triangle-exclamation-line" size="sm" color="current" />
    ) : undefined;
  const iconUsed = icon || defaultIcon;

  return (
    <span
      className={cn(
        pillClassGenerator({ type, shape, color }),
        // Tag adjustments
        tag && shape === 'circular' && 'ui:pl-3 ui:pr-1 ui:py-0.5',
        tag && shape === 'square' && 'ui:pl-3 ui:pr-1 ui:py-0.5',
        className
      )}
    >
      {iconUsed && <span className="ui:mr-1 ui:text-xs">{iconUsed}</span>}
      {children}
      {tag && (
        <div
          className={cn(
            'ui:ml-1 ui:px-2 ui:py-1 ui:text-xs ui:bg-grey-800 ui:text-white',
            shape === 'circular' ? 'ui:rounded-r-full' : 'ui:rounded-r-sm'
          )}
        >
          {tag}
        </div>
      )}
    </span>
  );
};
