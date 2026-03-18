import {
  createContext,
  HTMLAttributes,
  ReactNode,
  useContext,
  useRef,
} from 'react';

import { useDisclosure } from 'react-aria';
import { useDisclosureState } from 'react-stately';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { Separator } from '../Separator/Separator';

const disclosureVariants = cva(
  'ui:rounded-lg ui:bg-white ui:transition-colors ui:dark:bg-grey-800',
  {
    variants: {
      padding: {
        none: 'ui:p-0',
        sm: 'ui:p-4',
        md: 'ui:p-6',
        lg: 'ui:p-8',
      },
      shadow: {
        none: 'ui:shadow-none',
        sm: 'ui:shadow-sm',
        md: 'ui:shadow-md',
        lg: 'ui:shadow-lg',
      },
      border: {
        none: 'ui:border-0',
        thin: 'ui:border ui:border-grey-200 ui:dark:border-grey-700',
        medium: 'ui:border-2 ui:border-grey-200 ui:dark:border-grey-700',
      },
      disabled: {
        true: 'ui:cursor-not-allowed ui:opacity-40',
        false: '',
      },
    },
    defaultVariants: {
      padding: 'none',
      shadow: 'sm',
      border: 'thin',
      disabled: false,
    },
  }
);

export type DisclosureVariantProps = VariantProps<typeof disclosureVariants>;

export interface DisclosureProps extends DisclosureVariantProps {
  // Content
  children: ReactNode;

  // State
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;

  // Styling
  className?: string;

  // Accessibility
  'aria-label'?: string;
  'aria-labelledby'?: string;

  // Ref
  ref?: React.Ref<HTMLDivElement>;
}

// Context to share disclosure state, refs, and ARIA props with sub-components.
// useDisclosure must be called once to ensure aria-controls and panel id match.
interface DisclosureContextValue {
  state: ReturnType<typeof useDisclosureState>;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  buttonProps: ReturnType<typeof useDisclosure>['buttonProps'];
  panelProps: ReturnType<typeof useDisclosure>['panelProps'];
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null);

const useDisclosureContext = () => {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error(
      'Disclosure sub-components must be used within a Disclosure component'
    );
  }
  return context;
};

const BaseDisclosure = (props: DisclosureProps) => {
  const {
    // Content
    children,

    // State
    isExpanded,
    defaultExpanded = false,
    onExpandedChange,

    // Variants
    padding,
    shadow,
    border,
    disabled,

    // Styling
    className,

    // Ref
    ref,

    ...restProps
  } = props;

  // Use React Aria's disclosure state management
  const state = useDisclosureState({
    isExpanded,
    defaultExpanded,
    onExpandedChange,
  });

  // Create refs for button and panel
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { buttonProps, panelProps } = useDisclosure({}, state, panelRef);

  return (
    <DisclosureContext.Provider
      value={{ state, buttonRef, panelRef, buttonProps, panelProps }}
    >
      <div
        ref={ref}
        className={cn(
          disclosureVariants({
            padding,
            shadow,
            border,
            disabled,
          }),
          className
        )}
        {...restProps}
      >
        {children}
      </div>
    </DisclosureContext.Provider>
  );
};

BaseDisclosure.displayName = 'Disclosure';

// Sub-components for compound component pattern
const DisclosureHeader = (
  props: HTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    showChevron?: boolean;
    ref?: React.Ref<HTMLButtonElement>;
  }
) => {
  const {
    children,
    className,
    showChevron = true,
    onClick,
    ref,
    ...restProps
  } = props;
  const { state, buttonRef, buttonProps } = useDisclosureContext();

  // Merge onClick handlers
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    state.toggle();
    onClick?.(e);
  };

  return (
    <div className="ui:flex ui:w-full ui:flex-col ui:gap-4 ui:px-6 ui:py-4">
      <button
        {...buttonProps}
        ref={ref || buttonRef}
        type="button"
        onClick={handleClick}
        disabled
        className={cn(
          'ui:flex ui:w-full ui:items-center ui:justify-between ui:gap-4 ui:text-left ui:transition-colors',
          'focus:ui:outline-none focus-visible:ui:ring-2 focus-visible:ui:ring-blue-500 focus-visible:ui:ring-offset-2',
          className
        )}
        {...restProps}
      >
        <div className="ui:flex-1">{children}</div>
        {showChevron && (
          <Icon
            name={state.isExpanded ? 'chevron-up-line' : 'chevron-down-line'}
            size="sm"
            color="primary"
            className="ui:transition-transform ui:duration-200"
          />
        )}
      </button>
      {state.isExpanded && <Separator />}
    </div>
  );
};

DisclosureHeader.displayName = 'Disclosure.Header';

const DisclosureContent = (
  props: HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    ref?: React.Ref<HTMLDivElement>;
  }
) => {
  const { children, className, padding = 'md', ref, ...restProps } = props;
  const { state, panelRef, panelProps } = useDisclosureContext();

  const paddingClasses = {
    none: 'ui:p-0',
    sm: 'ui:px-6 ui:pb-4',
    md: 'ui:px-6 ui:pb-6',
    lg: 'ui:px-6 ui:pb-8',
  };

  return (
    <div
      {...panelProps}
      ref={ref || panelRef}
      className={cn(
        state.isExpanded && paddingClasses[padding],
        'ui:text-grey-900 ui:dark:text-white',
        className
      )}
      {...restProps}
    >
      {children}
    </div>
  );
};

DisclosureContent.displayName = 'Disclosure.Content';

// Create the Disclosure component with sub-components
type DisclosureComponent = typeof BaseDisclosure & {
  Header: typeof DisclosureHeader;
  Content: typeof DisclosureContent;
};

// Attach sub-components to Disclosure
const Disclosure = BaseDisclosure as DisclosureComponent;
Disclosure.Header = DisclosureHeader;
Disclosure.Content = DisclosureContent;

export { Disclosure };
