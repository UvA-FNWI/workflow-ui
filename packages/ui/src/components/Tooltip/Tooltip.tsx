import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

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

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/** Width of the arrow (border-4 on each side = 8px) */
const ARROW_SIZE = 8;

export interface TooltipProps extends TooltipTriggerProps {
  /** The content to display inside the tooltip */
  content: ReactNode;
  /** The trigger element */
  children: ReactNode;
  /** Additional class name for the tooltip popup */
  className?: string;
  /** Additional class name for the tooltip trigger */
  triggerClassName?: string;
  /** Preferred placement of the tooltip relative to the trigger */
  placement?: TooltipPlacement;
  /**
   * Whether the trigger wrapper itself should be focusable (tabIndex=0), so
   * keyboard users can reach the tooltip.
   * - `'auto'` (default): only when the children contain no enabled focusable
   *   element, e.g. plain text, an icon or a disabled button.
   * - `true` / `false`: force on / off.
   */
  isTriggerFocusable?: boolean | 'auto';
}

function TooltipPopup({
  state,
  className,
  content,
  triggerRef,
  overlayRef,
  placement,
  onTooltipHoverStart,
  onTooltipHoverEnd,
  ...props
}: {
  state: ReturnType<typeof useTooltipTriggerState>;
  className?: string;
  content: ReactNode;
  triggerRef: React.RefObject<HTMLSpanElement | null>;
  overlayRef: React.RefObject<HTMLSpanElement | null>;
  placement: TooltipPlacement;
  onTooltipHoverStart: () => void;
  onTooltipHoverEnd: () => void;
} & ReturnType<typeof useTooltipTrigger>['tooltipProps']) {
  // useTooltip keeps the tooltip open while the pointer is over it (WCAG 1.4.13 "hoverable")
  const { tooltipProps } = useTooltip(props, state);
  const {
    overlayProps,
    arrowProps,
    placement: resolvedPlacement,
  } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef,
    placement,
    offset: 8,
    // Let react-aria position the arrow as well. When the tooltip is shifted to stay inside the
    // viewport (e.g. a trigger near the screen edge), the arrow still points at the trigger.
    arrowSize: ARROW_SIZE,
    arrowBoundaryOffset: 4, // keep the arrow clear of the rounded corners
    // Allow the tooltip closer to the viewport edge (default 12px), so the arrow can still reach
    // triggers that sit right at the edge of the screen
    containerPadding: 4,
    isOpen: state.isOpen,
  });
  // arrowProps.style holds the position of the arrow's center along the tooltip edge
  const arrowStyle = arrowProps.style;

  return (
    <Overlay>
      <span
        ref={overlayRef}
        className={cn(
          'ui:z-50 ui:block ui:max-w-xs ui:rounded ui:bg-grey-900 ui:px-4 ui:py-3 ui:break-words ui:whitespace-normal',
          'ui:text-xs ui:text-white ui:dark:bg-grey-100 ui:dark:text-grey-900',
          className
        )}
        {...mergeProps(overlayProps, tooltipProps, {
          onPointerEnter: onTooltipHoverStart,
          onPointerLeave: onTooltipHoverEnd,
        })}
      >
        {content}
        {resolvedPlacement === 'top' && (
          <span
            {...arrowProps}
            style={{ left: arrowStyle?.left }}
            className="ui:absolute ui:top-full ui:-translate-x-1/2 ui:border-4 ui:border-transparent ui:border-t-grey-900 ui:dark:border-t-grey-100"
          />
        )}
        {resolvedPlacement === 'bottom' && (
          <span
            {...arrowProps}
            style={{ left: arrowStyle?.left }}
            className="ui:absolute ui:bottom-full ui:-translate-x-1/2 ui:border-4 ui:border-transparent ui:border-b-grey-900 ui:dark:border-b-grey-100"
          />
        )}
        {resolvedPlacement === 'left' && (
          <span
            {...arrowProps}
            style={{ top: arrowStyle?.top }}
            className="ui:absolute ui:left-full ui:-translate-y-1/2 ui:border-4 ui:border-transparent ui:border-l-grey-900 ui:dark:border-l-grey-100"
          />
        )}
        {resolvedPlacement === 'right' && (
          <span
            {...arrowProps}
            style={{ top: arrowStyle?.top }}
            className="ui:absolute ui:right-full ui:-translate-y-1/2 ui:border-4 ui:border-transparent ui:border-r-grey-900 ui:dark:border-r-grey-100"
          />
        )}
      </span>
    </Overlay>
  );
}

/**
 * Tooltip that meets WCAG 2.2 SC 1.4.13 (content on hover or focus):
 * - dismissible: Escape closes it without moving pointer or focus
 * - hoverable: the pointer can move onto the tooltip without it disappearing
 * - persistent: it stays visible until hover/focus is removed or it is dismissed
 *
 * It also opens on keyboard focus. When the trigger contains no focusable
 * element, the wrapper is made focusable so keyboard users can reach it.
 */
export function Tooltip({
  children,
  content,
  className,
  triggerClassName,
  delay = 300,
  placement = 'top',
  isTriggerFocusable = 'auto',
  ...props
}: TooltipProps) {
  const baseState = useTooltipTriggerState({ delay, ...props });
  // react-aria's hover tracking on the trigger ends the hover as soon as the pointer moves onto
  // the (portalled) tooltip, which would close it after `closeDelay`. While the pointer is over
  // the tooltip we ignore those delayed close requests, so the tooltip is hoverable
  // (WCAG 1.4.13). Immediate closes (Escape, press) still work.
  const isTooltipHovered = useRef(false);
  const state: typeof baseState = {
    ...baseState,
    close: (immediate?: boolean) => {
      if (isTooltipHovered.current && !immediate) return;
      baseState.close(immediate);
    },
  };
  const triggerRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const { triggerProps, tooltipProps } = useTooltipTrigger(
    { delay, ...props },
    state,
    triggerRef
  );

  // Determine whether the wrapper needs to be focusable
  const [hasFocusableChild, setHasFocusableChild] = useState(true);
  // Re-checked whenever the children change, e.g. a button becoming disabled
  useLayoutEffect(() => {
    if (isTriggerFocusable !== 'auto') return;
    const el = triggerRef.current;
    setHasFocusableChild(!!el?.querySelector(FOCUSABLE_SELECTOR));
  }, [children, isTriggerFocusable]);
  const wrapperFocusable =
    isTriggerFocusable === 'auto' ? !hasFocusableChild : isTriggerFocusable;

  // When a focusable child is the real trigger, point its aria-describedby at
  // the tooltip, so screen readers announce the tooltip on focus.
  const tooltipId = tooltipProps.id;
  useLayoutEffect(() => {
    if (wrapperFocusable || !state.isOpen || !tooltipId) return;
    const child =
      triggerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!child) return;
    const existing = child.getAttribute('aria-describedby');
    const ids = new Set((existing ?? '').split(' ').filter(Boolean));
    ids.add(tooltipId);
    child.setAttribute('aria-describedby', [...ids].join(' '));
    return () => {
      ids.delete(tooltipId);
      if (ids.size) child.setAttribute('aria-describedby', [...ids].join(' '));
      else child.removeAttribute('aria-describedby');
    };
  }, [wrapperFocusable, state.isOpen, tooltipId]);

  const { 'aria-describedby': describedBy, ...restTriggerProps } = triggerProps;

  return (
    <span
      className={cn(
        'ui:relative ui:inline-flex',
        wrapperFocusable &&
          'ui:rounded-xs ui:focus-visible:ring-2 ui:focus-visible:ring-navy-600 ui:focus-visible:outline-none ui:dark:focus-visible:ring-grey-400',
        triggerClassName
      )}
      ref={triggerRef}
      {...restTriggerProps}
      aria-describedby={wrapperFocusable ? describedBy : undefined}
      tabIndex={wrapperFocusable ? 0 : undefined}
    >
      {children}
      {state.isOpen && (
        <TooltipPopup
          state={state}
          onTooltipHoverStart={() => {
            isTooltipHovered.current = true;
          }}
          onTooltipHoverEnd={() => {
            isTooltipHovered.current = false;
            state.close();
          }}
          className={className}
          content={content}
          triggerRef={triggerRef}
          overlayRef={overlayRef}
          placement={placement}
          {...tooltipProps}
        />
      )}
    </span>
  );
}
