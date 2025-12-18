// React
import { cloneElement, HTMLAttributes, ReactElement, RefObject } from 'react';

import { TabListState } from 'react-stately';

// External
import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
// App
import { TabProps } from './Tab';

const tabListClassGenerator = cva('ui:flex ui:border-b ui:border-grey-500');

export type TabListProps = {
  // Only accepts Tab components as children
  children: Array<ReactElement<TabProps>>;
  activeIndex?: number;
  onTabClick?: (index: number) => void;
  tabListProps?: HTMLAttributes<HTMLElement>;
  tabListRef?: RefObject<HTMLDivElement | null>;
  state?: TabListState<object>;
} & HTMLAttributes<HTMLDivElement>;

const TabList = ({
  children,
  className,
  activeIndex = 0,
  onTabClick,
  tabListProps,
  tabListRef,
  state,
  ...otherProps
}: TabListProps) => {
  return (
    <div
      className={cn(tabListClassGenerator(), className)}
      {...tabListProps}
      {...otherProps}
      ref={tabListRef}
    >
      <div className="ui:flex ui:justify-start" id="tablist-container">
        {children.map((child, index) =>
          cloneElement(child, {
            key: index,
            isActive: index === activeIndex,
            onTabClick: () => onTabClick?.(index),
            item: state ? { key: index.toString() } : undefined,
            state,
          })
        )}
      </div>
    </div>
  );
};

export { TabList };
