import { ReactNode, useRef } from 'react';

import {
  mergeProps,
  Overlay,
  useOverlayPosition,
  useTooltip,
  useTooltipTrigger,
} from 'react-aria';
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
  /** Additional class name for the tooltip trigger */
  triggerClassName?: string;
}

function TooltipPopup({
  state,
  className,
  content,
  triggerRef,
  overlayRef,
  ...props
}: {
  state: ReturnType<typeof useTooltipTriggerState>;
  className?: string;
  content: ReactNode;
  triggerRef: React.RefObject<HTMLSpanElement | null>;
  overlayRef: React.RefObject<HTMLSpanElement | null>;
} & ReturnType<typeof useTooltipTrigger>['tooltipProps']) {
  const { tooltipProps } = useTooltip(props, state);
  const { overlayProps } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef,
    placement: 'top',
    offset: 8,
    isOpen: state.isOpen,
  });

  return (
    <Overlay>
      <span
        ref={overlayRef}
        className={cn(
          'ui:rounded ui:bg-grey-900 ui:px-4 ui:py-3 ui:whitespace-nowrap',
          'ui:text-xs ui:text-white ui:dark:bg-grey-100 ui:dark:text-grey-900',
          'ui:pointer-events-none ui:z-50',
          className
        )}
        {...mergeProps(overlayProps, tooltipProps)}
      >
        {content}
        <span
          className="ui:absolute ui:top-full ui:left-1/2 ui:-translate-x-1/2 ui:border-4 ui:border-transparent ui:border-t-grey-900 ui:dark:border-t-grey-100"
          aria-hidden="true"
        />
      </span>
    </Overlay>
  );
}

export function Tooltip({
  children,
  content,
  className,
  triggerClassName,
  delay = 300,
  ...props
}: TooltipProps) {
  const state = useTooltipTriggerState({ delay, ...props });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(
    { delay, ...props },
    state,
    triggerRef
  );

  return (
    <span
      className={cn('ui:relative ui:inline-flex', triggerClassName)}
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
          overlayRef={overlayRef}
          {...tooltipProps}
        />
      )}
    </span>
  );
}
