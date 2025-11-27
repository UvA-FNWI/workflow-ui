import { forwardRef, ReactNode, useEffect, useRef } from 'react';

import { FocusScope, useDialog, useModalOverlay } from 'react-aria';
import { createPortal } from 'react-dom';
import { useOverlayTriggerState } from 'react-stately';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { Icon } from '../Icon';

const modalClassGenerator = cva(
  // Base styles
  'ui:fixed ui:inset-0 ui:z-50 ui:flex ui:items-center ui:justify-center ui:p-4 ui:bg-black/30'
);

const dialogClassGenerator = cva(
  // Base styles
  'ui:relative ui:max-h-[90vh] ui:w-full ui:overflow-auto ui:bg-white ui:dark:bg-grey-900 ui:shadow-2xl ui:outline-none ui:rounded-none',
  {
    variants: {
      size: {
        sm: 'ui:max-w-md',
        md: 'ui:max-w-lg',
        lg: 'ui:max-w-2xl',
        xl: 'ui:max-w-4xl',
        full: 'ui:max-w-[95vw] ui:max-h-[95vh]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

type ModalVariantProps = VariantProps<typeof dialogClassGenerator>;

export interface ModalProps extends ModalVariantProps {
  // Content
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;

  // State
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;

  // Trigger (optional - for controlled usage)
  trigger?: ReactNode;

  // Close button
  showCloseButton?: boolean;

  // Styling
  className?: string;

  // Accessibility
  role?: 'dialog' | 'alertdialog';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;

  // Behavior
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  shouldBlockScroll?: boolean;
}

const ModalOverlay = ({
  children,
  onClose,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  shouldBlockScroll = true,
  className,
}: {
  children: ReactNode;
  onClose: () => void;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  shouldBlockScroll?: boolean;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Handle body scroll blocking
  useEffect(() => {
    if (shouldBlockScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [shouldBlockScroll]);

  // Create a simple state that mimics OverlayTriggerState
  const state = {
    isOpen: true,
    setOpen: (isOpen: boolean) => {
      if (!isOpen) {
        onClose();
      }
    },
    open: () => {},
    close: onClose,
    toggle: () => onClose(),
  };

  const { modalProps, underlayProps } = useModalOverlay(
    {
      isDismissable,
      isKeyboardDismissDisabled,
    },
    state,
    ref
  );

  return createPortal(
    <div {...underlayProps} ref={ref} className={className}>
      <FocusScope contain restoreFocus autoFocus>
        <div {...modalProps}>{children}</div>
      </FocusScope>
    </div>,
    document.body
  );
};

const ModalDialog = ({
  children,
  title,
  role = 'dialog',
  ...props
}: {
  children: ReactNode;
  title?: ReactNode;
  role?: 'dialog' | 'alertdialog';
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { dialogProps, titleProps } = useDialog(
    {
      role,
      'aria-labelledby': title ? 'modal-title' : undefined,
      ...props,
    },
    ref
  );

  return (
    <div {...dialogProps} ref={ref}>
      {title && (
        <h2 {...titleProps} id="modal-title" className="ui:sr-only">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

// Modal Content Component to avoid duplication
const ModalContent = forwardRef<
  HTMLDivElement,
  {
    title?: ReactNode;
    showCloseButton?: boolean;
    onClose: () => void;
    footer?: ReactNode;
    children: ReactNode;
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full' | null;
  }
>(
  (
    { title, showCloseButton, onClose, footer, children, size, ...restProps },
    ref
  ) => (
    <div
      className={cn(dialogClassGenerator({ size }))}
      ref={ref}
      {...restProps}
    >
      {/* Header */}
      {(title || showCloseButton) && (
        <header className="ui:flex ui:items-center ui:justify-between ui:border-b ui:border-grey-200 ui:dark:border-grey-800 ui:px-6 ui:py-4">
          {title && (
            <h2 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
              {title}
            </h2>
          )}

          {showCloseButton && (
            <Button
              intent="secondary"
              size="small"
              shape="circular"
              className="ui:ml-auto ui:border-0 ui:bg-transparent ui:hover:enabled:bg-grey-100 ui:dark:hover:enabled:bg-grey-800"
              onClick={onClose}
              aria-label="Close modal"
            >
              <Icon name="cross-line" size="sm" color="primary" />
            </Button>
          )}
        </header>
      )}

      {/* Body */}
      <div
        className={cn(
          'ui:px-6 ui:py-4',
          !title && !showCloseButton && 'ui:pt-6',
          !footer && 'ui:pb-6'
        )}
      >
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <footer className="ui:flex ui:items-center ui:justify-end ui:gap-3 ui:border-t ui:border-grey-200 ui:px-6 ui:py-4">
          {footer}
        </footer>
      )}
    </div>
  )
);

export const Modal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const {
    // Content
    title,
    children,
    footer,

    // State
    isOpen,
    onOpenChange,

    // Trigger
    trigger,

    // Close button
    showCloseButton = true,

    // Variants
    size = 'md',

    // Styling
    className,

    // Accessibility
    role = 'dialog',

    // Behavior
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    shouldBlockScroll = false,

    ...restProps
  } = props;

  // Use overlay trigger state for uncontrolled behavior when trigger is provided
  const overlayState = useOverlayTriggerState({
    defaultOpen: isOpen,
    isOpen,
    onOpenChange,
  });

  // If trigger is provided, return the trigger with the modal
  if (trigger) {
    return (
      <>
        <div onClick={() => overlayState.open()}>{trigger}</div>

        {overlayState.isOpen && (
          <ModalOverlay
            className={cn(modalClassGenerator(), className)}
            onClose={overlayState.close}
            isDismissable={isDismissable}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}
            shouldBlockScroll={shouldBlockScroll}
          >
            <ModalDialog title={title} role={role}>
              <ModalContent
                title={title}
                showCloseButton={showCloseButton}
                onClose={overlayState.close}
                footer={footer}
                size={size}
                ref={ref}
                {...restProps}
              >
                {children}
              </ModalContent>
            </ModalDialog>
          </ModalOverlay>
        )}
      </>
    );
  }

  // Don't render anything if not open (controlled usage)
  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay
      className={cn(modalClassGenerator(), className)}
      onClose={() => onOpenChange?.(false)}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      shouldBlockScroll={shouldBlockScroll}
    >
      <ModalDialog title={title} role={role}>
        <ModalContent
          title={title}
          showCloseButton={showCloseButton}
          onClose={() => onOpenChange?.(false)}
          footer={footer}
          size={size}
          ref={ref}
          {...restProps}
        >
          {children}
        </ModalContent>
      </ModalDialog>
    </ModalOverlay>
  );
});

Modal.displayName = 'Modal';
