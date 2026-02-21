// React
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

// External
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

const buttonClassGenerator = cva(
  // Base styles
  'ui:font-inherit ui:leading-inherit ui:relative ui:m-0 ui:inline-flex ui:cursor-pointer ui:appearance-none ui:items-center ui:justify-center ui:gap-1 ui:overflow-hidden ui:border ui:bg-transparent ui:text-ellipsis ui:whitespace-nowrap ui:transition-colors ui:duration-150 ui:ease-in-out',
  {
    variants: {
      intent: {
        primary:
          'ui:border-black ui:bg-black ui:text-white ui:hover:enabled:bg-grey-800 ui:dark:border-grey-400 ui:dark:bg-grey-800 ui:hover:enabled:dark:bg-grey-700',
        secondary:
          'ui:border-black ui:bg-white ui:text-black ui:hover:enabled:bg-grey-300 ui:dark:border-grey-400 ui:dark:bg-grey-900 ui:dark:text-white ui:hover:enabled:dark:bg-grey-800',
        destructivePrimary:
          'ui:border-red-600 ui:bg-red-600 ui:text-white ui:hover:enabled:border-red-800 ui:hover:enabled:bg-red-800 ui:dark:border-red-400 ui:dark:bg-red-700 ui:hover:enabled:dark:border-red-500 ui:hover:enabled:dark:bg-red-600',
        destructiveSecondary:
          'ui:border-red-brand ui:bg-white ui:text-red-brand ui:hover:enabled:bg-grey-300 ui:dark:border-red-400 ui:dark:bg-grey-900 ui:dark:text-red-400 ui:hover:enabled:dark:bg-grey-800',
        ghost:
          'ui:border-transparent ui:bg-transparent ui:text-black ui:hover:enabled:bg-grey-200 ui:dark:text-grey-100 ui:hover:enabled:dark:bg-grey-800',
      },
      size: {
        small: 'ui:h-6 ui:px-2 ui:text-xs',
        medium: 'ui:h-8 ui:px-3 ui:text-sm',
        large: 'ui:h-10 ui:px-4 ui:text-base',
        square: 'ui:h-8 ui:w-8 ui:p-0',
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
      onClick,
      ...restProps
    } = props;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    // Render
    return (
      <button
        {...restProps}
        type={type}
        ref={forwardedRef}
        onClick={handleClick}
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
            'ui:inline-flex ui:w-full ui:items-center ui:justify-center ui:gap-1',
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
