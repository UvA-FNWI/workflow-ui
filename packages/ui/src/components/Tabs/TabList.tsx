// React
import { cloneElement, HTMLAttributes, ReactElement } from 'react';

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
} & HTMLAttributes<HTMLDivElement>;

const TabList = ({
  children,
  className,
  activeIndex = 0,
  onTabClick,
  ...otherProps
}: TabListProps) => {
  return (
    <div
      className={cn(tabListClassGenerator(), className)}
      role="tablist"
      {...otherProps}
    >
      <div className="ui:flex ui:justify-start" id="tablist-container">
        {children.map((child, index) =>
          cloneElement(child, {
            key: index,
            isActive: index === activeIndex,
            onTabClick: () => onTabClick?.(index),
          })
        )}
      </div>
    </div>
  );
};

export { TabList };
