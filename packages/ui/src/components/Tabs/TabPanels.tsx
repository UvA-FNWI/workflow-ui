import { ReactElement } from 'react';

import { cx } from 'class-variance-authority';

import { TabPanel, TabPanelProps } from './TabPanel';

export type TabPanelsProps = {
  // Only accepts TabPanel components as children
  children: Array<ReactElement<TabPanelProps>>;
  activeIndex?: number;
  className?: string;
};

const TabPanels = ({
  children,
  activeIndex = 0,
  className,
}: TabPanelsProps) => (
  <div className={cx('TabPanels', className)}>
    {children.map((child, index) => (
      <TabPanel key={index} {...child.props} isActive={index === activeIndex} />
    ))}
  </div>
);

export { TabPanels };
