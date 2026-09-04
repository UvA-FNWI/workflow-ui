import {
  createContext,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useContext,
  useRef,
} from 'react';

import { FocusScope, useDialog, useModalOverlay } from 'react-aria';
import { createPortal } from 'react-dom';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { Icon } from '../Icon';

const modalClassGenerator = cva(
  // Base styles
  'ui:fixed ui:inset-0 ui:z-50 ui:flex ui:items-center ui:justify-center ui:bg-black/30 ui:p-4'
);

const dialogClassGenerator = cva(
  // Base styles
  'ui:relative ui:flex ui:max-h-[90vh] ui:w-full ui:flex-col ui:overflow-auto ui:rounded-none ui:bg-white ui:shadow-2xl ui:outline-none ui:dark:bg-grey-900',
  {
    variants: {
      size: {
        sm: 'ui:max-w-md',
        md: 'ui:max-w-lg',
        lg: 'ui:max-w-2xl',
        xl: 'ui:max-w-4xl',
        full: 'ui:max-h-[95vh] ui:max-w-[95vw]',
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
  children: ReactNode;

  // State
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;

  // Close button
  showCloseButton?: boolean;

  // Styling
  className?: string;
  ref?: React.Ref<HTMLDivElement>;

  // Accessibility
  role?: 'dialog' | 'alertdialog';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;

  // Behavior
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
}

// Context to share modal state with sub-components
interface ModalContextValue {
  onClose: () => void;
  showCloseButton: boolean;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      'Modal sub-components must be used within a Modal component'
    );
  }
  return context;
};

const ModalOverlay = ({
  children,
  onClose,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  className,
}: {
  children: ReactNode;
  onClose: () => void;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

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
        <div {...modalProps} className="ui:h-full ui:w-full">
          {children}
        </div>
      </FocusScope>
    </div>,
    document.body
  );
};

type ModalDialogProps = {
  children: ReactNode;
  role?: 'dialog' | 'alertdialog';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
};

const ModalDialog = ({
  children,
  role = 'dialog',
  ...ariaProps
}: ModalDialogProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { dialogProps } = useDialog(
    {
      role,
      ...ariaProps,
    },
    ref
  );

  return (
    <div
      {...dialogProps}
      ref={ref}
      className="ui:fixed ui:inset-0 ui:z-50 ui:flex ui:items-center ui:justify-center"
    >
      {children}
    </div>
  );
};

const BaseModal = (props: ModalProps) => {
  const {
    // Content
    children,

    // State
    isOpen,
    onOpenChange,

    // Close button
    showCloseButton = true,

    // Variants
    size = 'md',

    // Styling
    className,
    ref,

    // Accessibility
    role = 'dialog',

    // Behavior
    isDismissable = true,
    isKeyboardDismissDisabled = false,

    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,

    ...restProps
  } = props;

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  const handleClose = () => onOpenChange?.(false);

  return (
    <ModalOverlay
      className={cn(modalClassGenerator(), className)}
      onClose={handleClose}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
    >
      <ModalDialog
        role={role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        <ModalContext.Provider
          value={{ onClose: handleClose, showCloseButton }}
        >
          <div
            className={cn(dialogClassGenerator({ size }))}
            ref={ref}
            {...restProps}
          >
            {children}
          </div>
        </ModalContext.Provider>
      </ModalDialog>
    </ModalOverlay>
  );
};

BaseModal.displayName = 'Modal';

type ModalHeaderProps = HTMLAttributes<HTMLElement> & {
  subTitle?: string;
  description?: string;
};

// Sub-components for compound component pattern
const ModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(
  ({ children, className, subTitle, description, ...props }, ref) => {
    const { onClose, showCloseButton } = useModalContext();

    return (
      <header
        ref={ref}
        className={cn(
          'ui:flex ui:items-center ui:justify-between ui:px-6 ui:pt-6 ui:pb-2',
          className
        )}
        {...props}
      >
        <div className="ui:flex ui:flex-col">
          {subTitle && (
            <span className="ui:mb-1 ui:text-sm ui:text-grey-400 ui:dark:text-white">
              {subTitle}
            </span>
          )}

          <h2 className="ui:font-heading ui:text-2xl ui:font-semibold ui:text-black ui:dark:text-white">
            {children}
          </h2>
          {description && (
            <span className="ui:text-md ui:my-1 ui:text-black ui:dark:text-white">
              {description}
            </span>
          )}
        </div>
        {showCloseButton && (
          <Button
            intent="ghost"
            size="small"
            shape="circular"
            className="ui:ml-auto"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="cross-line" size="sm" color="primary" />
          </Button>
        )}
      </header>
    );
  }
);

ModalHeader.displayName = 'Modal.Header';

const ModalBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'ui:px-6 ui:py-2 ui:text-lg ui:text-grey-900 ui:dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ModalBody.displayName = 'Modal.Body';

const ModalFooter = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ children, className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        'ui:flex ui:items-center ui:justify-start ui:gap-3 ui:px-6 ui:py-4',
        className
      )}
      {...props}
    >
      {children}
    </footer>
  )
);

ModalFooter.displayName = 'Modal.Footer';

// Create the Modal component with sub-components
type ModalComponent = typeof BaseModal & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
};

// Attach sub-components to Modal
const Modal = BaseModal as ModalComponent;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export { Modal };
