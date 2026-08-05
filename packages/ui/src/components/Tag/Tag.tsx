import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';

const tagVariants = cva(
  'ui:inline-flex ui:w-fit ui:max-w-full ui:items-center ui:gap-1 ui:rounded-xs ui:bg-grey-300 ui:font-medium ui:text-grey-900 ui:dark:bg-grey-700 ui:dark:text-grey-100',
  {
    variants: {
      size: {
        sm: 'ui:min-h-5 ui:px-1.5 ui:text-xs',
        md: 'ui:min-h-6 ui:px-2 ui:text-sm',
        lg: 'ui:min-h-7 ui:px-2.5 ui:text-base',
      },
      isDisabled: {
        true: 'ui:opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      isDisabled: false,
    },
  }
);

export type TagVariantProps = VariantProps<typeof tagVariants>;

export interface TagProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'children'>,
    TagVariantProps {
  /** Tag content. */
  children: ReactNode;
  /** Shows a remove button and runs when it is activated. */
  onRemove?: () => void;
  /** Accessible name for the remove button. */
  removeLabel?: string;
}

/**
 * A compact value label with an optional remove action.
 */
export function Tag({
  children,
  onRemove,
  removeLabel,
  size,
  isDisabled = false,
  className,
  ...rest
}: TagProps) {
  const fallbackRemoveLabel =
    typeof children === 'string' ? `Remove ${children}` : 'Remove tag';

  return (
    <span
      {...rest}
      className={cn(tagVariants({ size, isDisabled }), className)}
    >
      <span className="ui:truncate">{children}</span>
      {onRemove && !isDisabled && (
        <button
          type="button"
          aria-label={removeLabel ?? fallbackRemoveLabel}
          className="ui:-mr-1 ui:inline-flex ui:h-5 ui:w-5 ui:shrink-0 ui:cursor-pointer ui:items-center ui:justify-center ui:rounded-xs ui:bg-transparent ui:p-0 ui:text-current ui:hover:bg-black/10 ui:focus-visible:ring-2 ui:focus-visible:ring-navy-600 ui:focus-visible:outline-none ui:dark:hover:bg-white/10 ui:dark:focus-visible:ring-sky-500"
          onMouseDown={event => event.preventDefault()}
          onClick={onRemove}
        >
          <Icon name="cross-small-line" size="xs" decorative />
        </button>
      )}
    </span>
  );
}
