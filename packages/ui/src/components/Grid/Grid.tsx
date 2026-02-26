import { HTMLAttributes, PropsWithChildren } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const gridVariants = cva('ui:grid ui:grid-cols-12 ui:gap-x-6', {
  variants: {
    /**
     * Vertical gap between rows. Defaults to the same 24px as the column gutter.
     */
    rowGap: {
      none: 'ui:gap-y-0',
      sm: 'ui:gap-y-3',
      md: 'ui:gap-y-6',
      lg: 'ui:gap-y-12',
    },
  },
  defaultVariants: {
    rowGap: 'md',
  },
});

export type GridVariantProps = VariantProps<typeof gridVariants>;

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>,
    GridVariantProps {}

/**
 * 12-column grid with 24px column gutters. Wrap `GridItem` children inside this component.
 */
export const Grid = ({
  children,
  className,
  rowGap,
  ...props
}: PropsWithChildren<GridProps>) => {
  return (
    <div className={cn(gridVariants({ rowGap }), className)} {...props}>
      {children}
    </div>
  );
};

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const colSpanMap: Record<ColSpan, string> = {
  1: 'ui:col-span-1',
  2: 'ui:col-span-2',
  3: 'ui:col-span-3',
  4: 'ui:col-span-4',
  5: 'ui:col-span-5',
  6: 'ui:col-span-6',
  7: 'ui:col-span-7',
  8: 'ui:col-span-8',
  9: 'ui:col-span-9',
  10: 'ui:col-span-10',
  11: 'ui:col-span-11',
  12: 'ui:col-span-12',
};

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to span (1–12).
   * @default 12
   */
  span?: ColSpan;
  /**
   * Number of columns to span on small screens (≥640px).
   */
  spanSm?: ColSpan;
  /**
   * Number of columns to span on medium screens (≥768px).
   */
  spanMd?: ColSpan;
  /**
   * Number of columns to span on large screens (≥1024px).
   */
  spanLg?: ColSpan;
}

const smColSpanMap: Record<ColSpan, string> = {
  1: 'ui:sm:col-span-1',
  2: 'ui:sm:col-span-2',
  3: 'ui:sm:col-span-3',
  4: 'ui:sm:col-span-4',
  5: 'ui:sm:col-span-5',
  6: 'ui:sm:col-span-6',
  7: 'ui:sm:col-span-7',
  8: 'ui:sm:col-span-8',
  9: 'ui:sm:col-span-9',
  10: 'ui:sm:col-span-10',
  11: 'ui:sm:col-span-11',
  12: 'ui:sm:col-span-12',
};

const mdColSpanMap: Record<ColSpan, string> = {
  1: 'ui:md:col-span-1',
  2: 'ui:md:col-span-2',
  3: 'ui:md:col-span-3',
  4: 'ui:md:col-span-4',
  5: 'ui:md:col-span-5',
  6: 'ui:md:col-span-6',
  7: 'ui:md:col-span-7',
  8: 'ui:md:col-span-8',
  9: 'ui:md:col-span-9',
  10: 'ui:md:col-span-10',
  11: 'ui:md:col-span-11',
  12: 'ui:md:col-span-12',
};

const lgColSpanMap: Record<ColSpan, string> = {
  1: 'ui:lg:col-span-1',
  2: 'ui:lg:col-span-2',
  3: 'ui:lg:col-span-3',
  4: 'ui:lg:col-span-4',
  5: 'ui:lg:col-span-5',
  6: 'ui:lg:col-span-6',
  7: 'ui:lg:col-span-7',
  8: 'ui:lg:col-span-8',
  9: 'ui:lg:col-span-9',
  10: 'ui:lg:col-span-10',
  11: 'ui:lg:col-span-11',
  12: 'ui:lg:col-span-12',
};

/**
 * A column within a `Grid`. Controls how many of the 12 columns this item spans,
 * with optional responsive overrides.
 */
export const GridItem = ({
  children,
  className,
  span = 12,
  spanSm,
  spanMd,
  spanLg,
  ...props
}: PropsWithChildren<GridItemProps>) => {
  return (
    <div
      className={cn(
        colSpanMap[span],
        spanSm && smColSpanMap[spanSm],
        spanMd && mdColSpanMap[spanMd],
        spanLg && lgColSpanMap[spanLg],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
