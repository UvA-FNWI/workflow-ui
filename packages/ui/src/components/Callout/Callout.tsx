import { HTMLAttributes, ReactNode, useState } from 'react';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';

const defaultType = 'info';

const calloutVariants = cva(
  'ui:relative ui:p-4 ui:w-full ui:break-words ui:grid ui:grid-cols-[auto_1fr_auto] ui:gap-3 ui:items-start ui:border-l-2 ui:text-grey-900',
  {
    variants: {
      type: {
        note: 'ui:bg-grey-300 ui:border-l-grey-600',
        error: 'ui:bg-red-200 ui:border-l-red-600',
        warning: 'ui:bg-orange-200 ui:border-l-orange-600',
        info: 'ui:bg-navy-200 ui:border-l-navy-600',
        success: 'ui:bg-forest-200 ui:border-l-forest-600',
      },
    },
    defaultVariants: {
      type: defaultType,
    },
  }
);

type CalloutType = NonNullable<VariantProps<typeof calloutVariants>['type']>;

export interface CalloutProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  header?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  isCloseable?: boolean;
}

export const Callout = ({
  header,
  action,
  icon,
  isCloseable = false,
  children,
  type,
  className,
  ...otherProps
}: CalloutProps) => {
  const [show, setShow] = useState(true);

  const iconMapping: Record<CalloutType, ReactNode> = {
    note: <Icon name="calendar-line" color="current" />,
    error: <Icon name="triangle-exclamation-line" color="current" />,
    warning: <Icon name="triangle-exclamation-line" color="current" />,
    info: <Icon name="square-info-line" color="current" />,
    success: <Icon name="circle-checkmark-line" color="current" />,
  };

  // Use custom icon if provided, otherwise use default icon based on type
  const calloutIcon = icon ?? iconMapping[type || defaultType];

  return show ? (
    <div className={cn(calloutVariants({ type }), className)} {...otherProps}>
      <div className="ui:flex ui:items-center ui:justify-center ui:text-xl ui:text-black">
        {calloutIcon}
      </div>

      <div className="ui:flex ui:flex-col ui:gap-1">
        {header && (
          <div className="ui:leading-tight ui:text-base ui:font-semibold">
            {header}
          </div>
        )}
        <div className="ui:text-sm">{children}</div>
        {action && (
          <div className="ui:text-base ui:font-semibold ui:cursor-pointer">
            {action}
          </div>
        )}
      </div>

      {isCloseable && (
        <div
          className="ui:flex ui:items-center ui:justify-center ui:cursor-pointer ui:p-2"
          onClick={() => setShow(false)}
        >
          <Icon name="cross-line" color="current" />
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};
