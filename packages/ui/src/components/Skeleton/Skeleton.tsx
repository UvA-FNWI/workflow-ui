import { HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className = '', ...otherProps }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'ui:animate-pulse ui:rounded ui:bg-grey-300 ui:dark:bg-grey-700',
        className
      )}
      {...otherProps}
    />
  );
};
