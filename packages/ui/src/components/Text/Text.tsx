import { HTMLAttributes, PropsWithChildren } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import './Text.scss';

export type TextVariantProps = VariantProps<typeof textVariants>;

const textVariants = cva('Text', {
  variants: {
    intent: {
      primary: 'text-primary',
      secondary: 'text-secondary',
    },
    size: {
      xs: 'font-size-xs',
      sm: 'font-size-sm',
      md: 'font-size-md',
      lg: 'font-size-lg',
      xl: 'font-size-xl',
      '2xl': 'font-size-2xl',
      '3xl': 'font-size-3xl',
    },

    decoration: {
      none: 'text-decoration-none',
      underline: 'text-decoration-underline',
      'line-through': 'text-decoration-line-through',
    },

    textTransform: {
      none: 'text-transform-none',
      uppercase: 'text-transform-uppercase',
      lowercase: 'text-transform-lowercase',
      capitalize: 'text-transform-capitalize',
    },

    truncate: {
      true: 'truncate',
      false: '',
    },
  },

  defaultVariants: {
    intent: 'primary',
    size: 'md',
    decoration: 'none',
    textTransform: 'none',
    truncate: false,
  },
});

interface TextProps
  extends HTMLAttributes<HTMLParagraphElement | HTMLSpanElement>,
    VariantProps<typeof textVariants> {
  as?: 'b' | 'p' | 'i' | 'span';
  color?: string;
  title?: string;
}

export const Text = ({
  children,
  as: Tag = 'p',
  size,
  className = '',
  decoration,
  textTransform,
  title = '',
  truncate,
  intent,
  ...otherProps
}: PropsWithChildren<TextProps & HTMLAttributes<HTMLParagraphElement>>) => {
  return (
    <Tag
      className={textVariants({
        size,
        decoration,
        textTransform,
        truncate,
        className,
        intent,
      })}
      title={truncate && !title ? String(children) : title}
      {...otherProps}
    >
      {children}
    </Tag>
  );
};
