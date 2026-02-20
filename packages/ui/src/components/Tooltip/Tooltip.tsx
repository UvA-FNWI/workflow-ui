import { ReactNode, useEffect, useRef, useState } from 'react';

import { mergeProps, useTooltip, useTooltipTrigger } from 'react-aria';
import { createPortal } from 'react-dom';
import { useTooltipTriggerState } from 'react-stately';
import type { TooltipTriggerProps } from 'react-stately';

import { cn } from '../../utils/cn';

export interface TooltipProps extends TooltipTriggerProps {
  /** The content to display inside the tooltip */
  content: ReactNode;
  /** The trigger element */
  children: ReactNode;
  /** Additional class name for the tooltip popup */
  className?: string;
}

function TooltipPopup({
  state,
  className,
  content,
  triggerRef,
  ...props
}: {
  state: ReturnType<typeof useTooltipTriggerState>;
  className?: string;
  content: ReactNode;
  triggerRef: React.RefObject<HTMLSpanElement | null>;
} & ReturnType<typeof useTooltipTrigger>['tooltipProps']) {
  const { tooltipProps } = useTooltip(props, state);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [triggerRef]);

  return createPortal(
    <span
      className={cn(
        'ui:fixed ui:-translate-x-1/2 ui:-translate-y-full',
        'ui:-mt-2 ui:rounded ui:bg-grey-900 ui:px-4 ui:py-3 ui:whitespace-nowrap',
        'ui:text-xs ui:text-white ui:dark:bg-grey-100 ui:dark:text-grey-900',
        'ui:pointer-events-none ui:z-50',
        className
      )}
      style={{ top: position.top, left: position.left }}
      {...mergeProps(props, tooltipProps)}
    >
      {content}
      <span
        className="ui:absolute ui:top-full ui:left-1/2 ui:-translate-x-1/2 ui:border-4 ui:border-transparent ui:border-t-grey-900 ui:dark:border-t-grey-100"
        aria-hidden="true"
      />
    </span>,
    document.body
  );
}

export function Tooltip({
  children,
  content,
  className,
  delay = 300,
  ...props
}: TooltipProps) {
  const state = useTooltipTriggerState({ delay, ...props });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(
    { delay, ...props },
    state,
    triggerRef
  );

  return (
    <span
      className="ui:relative ui:inline-flex"
      ref={triggerRef}
      {...triggerProps}
    >
      {children}
      {state.isOpen && (
        <TooltipPopup
          state={state}
          className={className}
          content={content}
          triggerRef={triggerRef}
          {...tooltipProps}
        />
      )}
    </span>
  );
}
