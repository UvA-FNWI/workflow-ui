import { PropsWithChildren, useRef } from 'react';

import { useTab } from 'react-aria';
import { TabListState } from 'react-stately';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const tabClassGenerator = cva(
  'ui:p-3 ui:text-sm ui:flex ui:items-center ui:border-b ui:border-transparent ui:cursor-pointer ui:bg-transparent ui:transition-colors ui:duration-150 ui:ease-in-out',
  {
    variants: {
      isActive: {
        true: 'ui:font-semibold ui:border-black ui:cursor-pointer',
        false: 'ui:font-normal',
      },
      disabled: {
        true: 'ui:opacity-50 ui:cursor-not-allowed ui:pointer-events-auto',
        false: '',
      },
    },
    defaultVariants: {
      isActive: false,
      disabled: false,
    },
  }
);

export interface TabProps extends PropsWithChildren {
  isActive?: boolean;
  onTabClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  item?: { key: string };
  state?: TabListState<object>;
}

const Tab: React.FunctionComponent<TabProps> = ({
  children,
  isActive = false,
  disabled = false,
  hidden = false,
  ref: externalRef,
  item,
  state,
}) => {
  const internalRef = useRef<HTMLButtonElement>(null);
  const ref = externalRef || internalRef;

  // Use react-aria for accessibility when state is available
  const { tabProps } = useTab(
    { key: item?.key || '0', isDisabled: disabled },
    state as TabListState<object>,
    ref as React.RefObject<HTMLElement>
  );

  if (hidden) return null;

  return (
    <button
      {...tabProps}
      className={cn(tabClassGenerator({ isActive, disabled }))}
      ref={ref as React.Ref<HTMLButtonElement>}
    >
      {children}
    </button>
  );
};

export { Tab };
