import { ReactElement } from 'react';

import { TabListState } from 'react-stately';

import { cx } from 'class-variance-authority';

import { TabPanel, TabPanelProps } from './TabPanel';

export type TabPanelsProps = {
  // Only accepts TabPanel components as children
  children: Array<ReactElement<TabPanelProps>>;
  activeIndex?: number;
  className?: string;
  state?: TabListState<object>;
};

const TabPanels = ({
  children,
  activeIndex = 0,
  className,
  state,
}: TabPanelsProps) => (
  <div className={cx('TabPanels', className)}>
    {children.map((child, index) => (
      <TabPanel
        key={index}
        {...child.props}
        isActive={index === activeIndex}
        item={{ key: index.toString() }}
        state={state}
      />
    ))}
  </div>
);

export { TabPanels };
