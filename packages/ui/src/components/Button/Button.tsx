// React
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

// External
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

const buttonClassGenerator = cva(
  // Base styles
  'ui:font-inherit ui:leading-inherit ui:relative ui:m-0 ui:inline-flex ui:cursor-pointer ui:appearance-none ui:items-center ui:justify-center ui:gap-1 ui:overflow-hidden ui:border ui:bg-transparent ui:text-ellipsis ui:whitespace-nowrap ui:transition-colors ui:duration-150 ui:ease-in-out ui:focus-visible:ring-2 ui:focus-visible:ring-navy-600 ui:focus-visible:ring-offset-2 ui:focus-visible:outline-none ui:dark:focus-visible:ring-grey-400 ui:dark:focus-visible:ring-offset-grey-900',
  {
    variants: {
      intent: {
        primary: '',
        secondary: '',
        ghost: '',
      },
      variant: {
        default: '',
        destructive: '',
      },
      size: {
        small: 'ui:h-6 ui:px-2 ui:text-xs',
        medium: 'ui:h-8 ui:px-3 ui:text-sm',
        large: 'ui:h-10 ui:px-4 ui:text-base',
        square: 'ui:h-8 ui:w-8 ui:p-0',
      },
      shape: {
        circular: 'ui:rounded-full',
        default: 'ui:rounded-xs',
      },
      width: {
        full: 'ui:w-full',
        regular: 'ui:w-auto',
        none: '',
      },
    },
    compoundVariants: [
      // Disabled styles (shared across variants per intent)
      {
        intent: ['primary', 'secondary'],
        className:
          'ui:disabled:border-grey-400 ui:disabled:bg-grey-400 ui:disabled:text-grey-700 ui:dark:disabled:border-grey-700 ui:dark:disabled:bg-grey-700 ui:dark:disabled:text-grey-400',
      },
      {
        intent: 'ghost',
        className:
          'ui:disabled:bg-transparent ui:disabled:text-grey-700 ui:dark:disabled:text-grey-400',
      },

      // Default primary
      {
        intent: 'primary',
        variant: 'default',
        className:
          'ui:border-black ui:bg-black ui:text-white ui:hover:enabled:border-grey-700 ui:hover:enabled:bg-grey-700 ui:dark:border-white ui:dark:bg-white ui:dark:text-black ui:hover:enabled:dark:border-grey-400 ui:hover:enabled:dark:bg-grey-400',
      },
      // Default secondary
      {
        intent: 'secondary',
        variant: 'default',
        className:
          'ui:border-black ui:bg-white ui:text-black ui:hover:text-white ui:hover:enabled:bg-black ui:dark:border-white ui:dark:bg-grey-900 ui:dark:text-white ui:hover:enabled:dark:bg-white ui:hover:enabled:dark:text-black',
      },
      // Default ghost
      {
        intent: 'ghost',
        variant: 'default',
        className:
          'ui:border-transparent ui:bg-transparent ui:text-black ui:hover:enabled:border-black ui:dark:text-white ui:hover:enabled:dark:border-white',
      },
      // Destructive primary
      {
        intent: 'primary',
        variant: 'destructive',
        className:
          'ui:border-red-600 ui:bg-red-600 ui:text-white ui:hover:enabled:border-red-800 ui:hover:enabled:bg-red-800 ui:dark:text-grey-900',
      },
      // Destructive secondary
      {
        intent: 'secondary',
        variant: 'destructive',
        className:
          'ui:border-red-600 ui:bg-white ui:text-red-600 ui:hover:enabled:bg-red-600 ui:hover:enabled:text-white ui:dark:bg-grey-900 ui:hover:enabled:dark:text-grey-900',
      },
      // Destructive ghost
      {
        intent: 'ghost',
        variant: 'destructive',
        className:
          'ui:border-transparent ui:bg-transparent ui:text-red-600 ui:hover:enabled:border-red-600 ui:hover:enabled:dark:border-red-600',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'medium',
      shape: 'default',
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
  width?: 'full' | 'regular' | 'none';

  // Icons
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, forwardedRef) => {
    const {
      children,
      intent,
      variant,
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
            variant,
            size,
            shape,
            width,
          }),
          width === 'full' && 'ui:justify-between',
          (disabled || isLoading) && 'ui:disabled:cursor-not-allowed',
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
