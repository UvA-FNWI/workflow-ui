import { HTMLAttributes, PropsWithChildren } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export type TextVariantProps = VariantProps<typeof textVariants>;

const textVariants = cva('font-body inline-block p-0 m-0', {
  variants: {
    intent: {
      primary: 'text-black dark:text-white',
      secondary: 'text-grey-600 dark:text-grey-400',
    },
    size: {
      xs: 'text-xs', // 12px
      sm: 'text-sm', // 14px
      md: 'text-md', // 16px
      lg: 'text-lg', // 18px
      xl: 'text-xl', // 20px
      '2xl': 'text-2xl', // 24px
      '3xl': 'text-3xl', // 30px
    },
    decoration: {
      none: 'no-underline',
      underline: 'underline',
      'line-through': 'line-through',
    },
    textTransform: {
      none: 'normal-case',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
    truncate: {
      true: 'overflow-hidden text-ellipsis whitespace-nowrap w-full',
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
  color,
  style,
  ...otherProps
}: PropsWithChildren<TextProps & HTMLAttributes<HTMLParagraphElement>>) => {
  return (
    <Tag
      className={cn(
        textVariants({
          size,
          decoration,
          textTransform,
          truncate,
          intent,
        }),
        // Font weight classes based on tag
        Tag === 'b' && 'font-bold',
        (Tag === 'p' || Tag === 'span' || Tag === 'i') && 'font-normal',
        className
      )}
      style={{
        ...(color && { color }),
        ...style,
      }}
      title={truncate && !title ? String(children) : title}
      {...otherProps}
    >
      {children}
    </Tag>
  );
};
