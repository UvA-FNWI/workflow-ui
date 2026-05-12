import { useRef } from 'react';

import { AriaPopoverProps, Overlay, usePopover } from 'react-aria';
import { OverlayTriggerState, useOverlayTriggerState } from 'react-stately';

import { cn } from '../../utils/cn';

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode;
  state: OverlayTriggerState;
  triggerRef: React.RefObject<HTMLElement>;
  className?: string;
}

export const usePopoverState = () => useOverlayTriggerState({});

export type PopoverState = OverlayTriggerState;
export const Popover: React.FC<PopoverProps> = ({
  children,
  state,
  triggerRef,
  className,
  ...props
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { popoverProps } = usePopover(
    {
      ...props,
      triggerRef,
      popoverRef,
    },
    state
  );

  return (
    <Overlay>
      <div
        {...popoverProps}
        ref={popoverRef}
        className={cn('ui:absolute ui:z-50 ui:mt-2', className)}
      >
        {children}
      </div>
    </Overlay>
  );
};
