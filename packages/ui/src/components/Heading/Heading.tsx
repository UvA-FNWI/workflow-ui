import { HTMLAttributes, PropsWithChildren } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export type HeadingVariantProps = VariantProps<typeof headingVariants>;

const headingVariants = cva('ui:m-0 ui:p-0', {
  variants: {
    size: {
      xs: 'ui:text-lg',
      sm: 'ui:text-xl',
      md: 'ui:text-2xl',
      lg: 'ui:text-3xl',
      xl: 'ui:text-4xl',
    },
    fontType: {
      heading: 'ui:font-heading',
      body: 'ui:font-body',
    },
  },
  defaultVariants: {
    size: 'md',
    fontType: 'heading',
  },
  compoundVariants: [
    {
      size: 'xs',
      fontType: undefined,
      className: 'ui:font-body',
    },
    {
      size: 'xs',
      fontType: 'heading',
      className: 'ui:font-heading',
    },
  ],
});

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

const sizeToTag: Record<
  NonNullable<HeadingVariantProps['size']>,
  HeadingTag
> = {
  xs: 'h5',
  sm: 'h4',
  md: 'h3',
  lg: 'h2',
  xl: 'h1',
};

interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    HeadingVariantProps {
  as?: HeadingTag;
  color?: string;
}

export const Heading = ({
  as,
  children,
  size,
  className,
  fontType,
  ...otherProps
}: PropsWithChildren<HeadingProps>) => {
  const Tag = as || sizeToTag[size ?? 'md'];
  return (
    <Tag
      className={cn(
        headingVariants({
          size,
          fontType,
        }),
        className
      )}
      {...otherProps}
    >
      {children}
    </Tag>
  );
};
