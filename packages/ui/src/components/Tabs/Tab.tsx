import { PropsWithChildren, useRef } from 'react';

import { useTab } from 'react-aria';
import { TabListState } from 'react-stately';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const tabClassGenerator = cva(
  'ui:p-3 ui:text-sm ui:flex ui:items-center ui:border-b ui:border-transparent ui:cursor-pointer ui:bg-transparent ui:border-0 ui:border-b ui:transition-colors ui:duration-150 ui:ease-in-out',
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
  onTabClick,
  disabled = false,
  hidden = false,
  ref: externalRef,
  item,
  state,
}) => {
  const internalRef = useRef<HTMLButtonElement>(null);
  const tabRef = externalRef || internalRef;

  // Always call useTab hook, but only use its result if state is provided
  const ariaResult = useTab(
    {
      key: item?.key || '0',
      isDisabled: disabled,
    },
    state as TabListState<object>,
    tabRef as React.RefObject<HTMLElement>
  );

  // Use react-aria's props if state is provided, otherwise use fallback
  const tabProps =
    state && item
      ? ariaResult.tabProps
      : {
          onClick: () => !disabled && onTabClick?.(),
          role: 'tab',
          'aria-selected': isActive,
          'aria-disabled': disabled,
          type: 'button' as const,
        };

  return hidden ? (
    <></>
  ) : (
    <button
      {...tabProps}
      className={cn(tabClassGenerator({ isActive, disabled }))}
      ref={tabRef as React.Ref<HTMLButtonElement>}
    >
      {children}
    </button>
  );
};

export { Tab };
