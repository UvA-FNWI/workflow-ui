import { HTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../utils/cn';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width of the container in pixels.
   * Use `'full'` to stretch to the full width of the screen.
   * @default 944
   */
  maxWidth?: number | 'full';
}

/**
 * Centers content horizontally with a maximum width and consistent side margins (12px).
 * Use `maxWidth="full"` for layouts that should stretch edge-to-edge.
 */
export const Container = ({
  children,
  className,
  maxWidth = 944,
  style,
  ...props
}: PropsWithChildren<ContainerProps>) => {
  return (
    <div
      className={cn('ui:mx-auto ui:w-full ui:px-3 ui:py-6', className)}
      style={{
        ...(maxWidth !== 'full' ? { maxWidth } : undefined),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
