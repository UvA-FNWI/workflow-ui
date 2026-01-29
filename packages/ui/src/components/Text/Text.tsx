import { HTMLAttributes, PropsWithChildren } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';

export type TextVariantProps = VariantProps<typeof textVariants>;

const textVariants = cva('ui:font-body ui:m-0 ui:p-0', {
  variants: {
    intent: {
      primary: 'ui:text-black ui:dark:text-white',
      secondary: 'ui:text-grey-600 ui:dark:text-grey-400',
      error: 'ui:text-red-600 ui:dark:text-red-400',
    },
    size: {
      xs: 'ui:text-xs', // 12px
      sm: 'ui:text-sm', // 14px
      md: 'ui:text-base', // 16px
      lg: 'ui:text-lg', // 18px
      xl: 'ui:text-xl', // 20px
      '2xl': 'ui:text-2xl', // 24px
      '3xl': 'ui:text-3xl', // 30px
    },
    fontWeight: {
      normal: 'ui:font-normal',
      semibold: 'ui:font-semibold',
      bold: 'ui:font-bold',
    },
    decoration: {
      none: 'ui:no-underline',
      underline: 'ui:underline',
      'line-through': 'ui:line-through',
    },
    textTransform: {
      none: 'ui:normal-case',
      uppercase: 'ui:uppercase',
      lowercase: 'ui:lowercase',
      capitalize: 'ui:capitalize',
    },
    truncate: {
      true: 'ui:w-full ui:overflow-hidden ui:text-ellipsis ui:whitespace-nowrap',
      false: '',
    },
    display: {
      inline: 'ui:inline',
      'inline-block': 'ui:inline-block',
      block: 'ui:block',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
    fontWeight: 'normal',
    decoration: 'none',
    textTransform: 'none',
    truncate: false,
    display: 'inline-block',
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
  fontWeight,
  decoration,
  textTransform,
  title = '',
  truncate,
  intent,
  display,
  color,
  style,
  ...otherProps
}: PropsWithChildren<TextProps & HTMLAttributes<HTMLParagraphElement>>) => {
  return (
    <Tag
      className={cn(
        textVariants({
          size,
          fontWeight,
          decoration,
          textTransform,
          truncate,
          intent,
          display,
        }),
        // Font weight classes based on tag
        Tag === 'b' && 'ui:font-bold',
        (Tag === 'p' || Tag === 'span' || Tag === 'i') && 'ui:font-normal',
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
