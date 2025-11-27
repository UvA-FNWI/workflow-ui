import { PropsWithChildren } from 'react';

import { cx } from 'class-variance-authority';

export interface TabPanelProps extends PropsWithChildren {
  isActive?: boolean;
  className?: string;
}

const TabPanel: React.FunctionComponent<TabPanelProps> = ({
  children,
  isActive,
  className,
}) => {
  return isActive ? (
    <div className={cx('TabPanel', className)} role="tabpanel">
      {children}
    </div>
  ) : null;
};

export { TabPanel };
