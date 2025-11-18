import { HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className = '', ...otherProps }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'bg-grey-300 dark:bg-grey-700 animate-pulse rounded',
        className
      )}
      {...otherProps}
    />
  );
};
