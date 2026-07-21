import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const pageMarkVariants = cva(
  'ui:pointer-events-none ui:top-0 ui:left-0 ui:z-50 ui:h-[150px] ui:w-[150px] ui:overflow-hidden',
  {
    variants: {
      variant: {
        primary: '',
        secondary: '',
        tertiary: '',
      },
      position: {
        fixed: 'ui:fixed',
        absolute: 'ui:absolute',
      },
    },
    defaultVariants: {
      variant: 'primary',
      position: 'fixed',
    },
  }
);

const labelVariants = cva(
  'ui:w-[200px] ui:-translate-x-[25%] ui:-translate-y-[-60%] ui:-rotate-45 ui:py-3 ui:text-center ui:text-sm ui:font-semibold ui:uppercase ui:shadow-md',
  {
    variants: {
      variant: {
        primary: 'ui:bg-orange-500 ui:text-white',
        secondary: 'ui:bg-forest-600 ui:text-white',
        tertiary: 'ui:bg-grey-600 ui:text-white',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export type PageMarkVariant = NonNullable<
  VariantProps<typeof pageMarkVariants>['variant']
>;

export interface PageMarkProps {
  /** The text displayed in the ribbon */
  label: string;
  /** Color variant of the ribbon */
  variant?: PageMarkVariant;
  /** Positioning strategy */
  position?: 'fixed' | 'absolute';
  /** Additional className for custom styling */
  className?: string;
}

export function PageMark({
  label,
  variant = 'primary',
  position = 'fixed',
  className,
}: PageMarkProps) {
  return (
    <div className={cn(pageMarkVariants({ variant, position }), className)}>
      <div className={labelVariants({ variant })}>{label}</div>
    </div>
  );
}
