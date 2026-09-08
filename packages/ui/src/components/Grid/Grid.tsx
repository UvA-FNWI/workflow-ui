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
  extends HTMLAttributes<HTMLDivElement>, GridVariantProps {}

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

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * A responsive value that can either be a plain value or a breakpoint object.
 * @example
 * // Uniform across all breakpoints
 * span={6}
 * // Responsive
 * span={{ base: 12, md: 6, lg: 4 }}
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

const colSpanClasses: Record<Breakpoint, Record<ColSpan, string>> = {
  base: {
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
  },
  sm: {
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
  },
  md: {
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
  },
  lg: {
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
  },
  xl: {
    1: 'ui:xl:col-span-1',
    2: 'ui:xl:col-span-2',
    3: 'ui:xl:col-span-3',
    4: 'ui:xl:col-span-4',
    5: 'ui:xl:col-span-5',
    6: 'ui:xl:col-span-6',
    7: 'ui:xl:col-span-7',
    8: 'ui:xl:col-span-8',
    9: 'ui:xl:col-span-9',
    10: 'ui:xl:col-span-10',
    11: 'ui:xl:col-span-11',
    12: 'ui:xl:col-span-12',
  },
};

function resolveResponsiveColSpan(span: ResponsiveValue<ColSpan>): string {
  if (typeof span === 'number') {
    return colSpanClasses.base[span];
  }
  return (Object.entries(span) as [Breakpoint, ColSpan | undefined][])
    .map(([bp, value]) =>
      value !== undefined ? colSpanClasses[bp]?.[value] : undefined
    )
    .filter(Boolean)
    .join(' ');
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to span (1–12). Accepts a plain number or a responsive
   * breakpoint object.
   * @example
   * span={6}
   * span={{ base: 12, md: 6, lg: 4 }}
   * @default 12
   */
  span?: ResponsiveValue<ColSpan>;
}

/**
 * A column within a `Grid`. Controls how many of the 12 columns this item spans,
 * with optional responsive overrides.
 */
export const GridItem = ({
  children,
  className,
  span = 12,
  ...props
}: PropsWithChildren<GridItemProps>) => {
  return (
    <div className={cn(resolveResponsiveColSpan(span), className)} {...props}>
      {children}
    </div>
  );
};
