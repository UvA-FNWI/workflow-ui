// React
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

// External
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

const buttonClassGenerator = cva(
  // Base styles
  'ui:relative ui:inline-flex ui:items-center ui:justify-center ui:appearance-none ui:bg-transparent ui:cursor-pointer ui:font-inherit ui:leading-inherit ui:m-0 ui:whitespace-nowrap ui:transition-colors ui:duration-150 ui:ease-in-out ui:overflow-hidden ui:text-ellipsis ui:border ui:gap-1',
  {
    variants: {
      intent: {
        primary:
          'ui:bg-black ui:text-white ui:border-black ui:hover:enabled:bg-grey-800 ui:dark:bg-grey-800 ui:dark:border-grey-400 ui:hover:enabled:dark:bg-grey-700',
        secondary:
          'ui:bg-white ui:text-black ui:border-black ui:hover:enabled:bg-grey-300 ui:dark:bg-grey-900 ui:dark:text-white ui:dark:border-grey-400 ui:hover:enabled:dark:bg-grey-800',
        destructivePrimary:
          'ui:bg-red-600 ui:text-white ui:border-red-600 ui:hover:enabled:border-red-800 ui:hover:enabled:bg-red-800 ui:dark:bg-red-700 ui:dark:border-red-400 ui:hover:enabled:dark:bg-red-600 ui:hover:enabled:dark:border-red-500',
        destructiveSecondary:
          'ui:bg-white ui:text-red-brand ui:border-red-brand ui:hover:enabled:bg-grey-300 ui:dark:bg-grey-900 ui:dark:text-red-400 ui:dark:border-red-400 ui:hover:enabled:dark:bg-grey-800',
        ghost:
          'ui:bg-transparent ui:text-black ui:border-transparent ui:hover:enabled:bg-grey-200 ui:dark:text-white ui:hover:enabled:dark:bg-grey-800',
      },
      size: {
        small: 'ui:px-2 ui:h-6 ui:text-xs',
        medium: 'ui:px-3 ui:h-8 ui:text-sm',
        large: 'ui:px-4 ui:h-10 ui:text-base',
        square: 'ui:p-0 ui:h-8 ui:w-8',
      },
      shape: {
        rounded: 'ui:rounded-md',
        circular: 'ui:rounded-full',
        square: 'ui:rounded-none',
      },
      width: {
        full: 'ui:w-full',
        regular: 'ui:w-auto',
      },
    },
    defaultVariants: {
      size: 'medium',
      shape: 'rounded',
      width: 'regular',
    },
  }
);

type ButtonVariantProps = VariantProps<typeof buttonClassGenerator>;
// Require the intent
interface ReqButtonVariantProps
  extends Omit<ButtonVariantProps, 'intent'>,
    Required<Pick<ButtonVariantProps, 'intent'>> {}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ReqButtonVariantProps {
  isLoading?: boolean;
  loadingText?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  width?: 'full' | 'regular';

  // Icons
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, forwardedRef) => {
    const {
      children,
      intent,
      size,
      shape,
      className,
      isLoading,
      loadingText,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      width = 'regular',
      ...restProps
    } = props;

    // Render
    return (
      <button
        {...restProps}
        type={type}
        ref={forwardedRef}
        className={cn(
          buttonClassGenerator({
            intent,
            size,
            shape,
            width,
          }),
          width === 'full' && 'ui:justify-between',
          (disabled || isLoading) &&
            'ui:disabled:cursor-not-allowed ui:disabled:opacity-50',
          className
        )}
        disabled={disabled || isLoading}
        role="button"
      >
        {/* Content */}
        <div
          className={cn(
            'ui:w-full ui:inline-flex ui:gap-1 ui:items-center ui:justify-center',
            isLoading && !loadingText && 'ui:invisible',
            isLoading && loadingText && 'ui:hidden'
          )}
        >
          <div className="ui:flex ui:items-center ui:gap-1">
            {leftIcon && <span className="ui:mr-1">{leftIcon}</span>}
            {children}
          </div>

          {rightIcon && <span>{rightIcon}</span>}
        </div>

        {/* Spinner */}
        {isLoading && (
          <div
            className={cn(
              'ui:absolute ui:flex ui:items-center',
              loadingText && 'ui:relative'
            )}
          >
            <LoadingSpinner size="xs" />
          </div>
        )}

        {/* Loading text */}
        {isLoading && loadingText && (
          <div className="ui:ml-2">{loadingText}</div>
        )}
      </button>
    );
  }
);
