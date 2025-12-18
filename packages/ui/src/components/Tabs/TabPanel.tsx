import { PropsWithChildren, useRef } from 'react';

import { useTabPanel } from 'react-aria';
import { TabListState } from 'react-stately';

import { cx } from 'class-variance-authority';

export interface TabPanelProps extends PropsWithChildren {
  isActive?: boolean;
  className?: string;
  item?: { key: string };
  state?: TabListState<object>;
}

const TabPanel: React.FunctionComponent<TabPanelProps> = ({
  children,
  isActive,
  className,
  item,
  state,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Always call useTabPanel hook
  const ariaResult = useTabPanel(
    { id: item?.key || '0' },
    state as TabListState<object>,
    ref
  );

  // Use react-aria's props if state is provided
  const tabPanelProps =
    state && item
      ? ariaResult.tabPanelProps
      : {
          role: 'tabpanel' as const,
        };

  return isActive ? (
    <div {...tabPanelProps} className={cx('TabPanel', className)} ref={ref}>
      {children}
    </div>
  ) : null;
};

export { TabPanel };
