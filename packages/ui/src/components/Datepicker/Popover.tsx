import { useRef } from 'react';

import { AriaPopoverProps, Overlay, usePopover } from 'react-aria';
import { OverlayTriggerState } from 'react-stately';

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode;
  state: OverlayTriggerState;
  triggerRef: React.RefObject<HTMLElement>;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  state,
  triggerRef,
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
        className="ui:absolute ui:z-50 ui:mt-2"
      >
        {children}
      </div>
    </Overlay>
  );
};
