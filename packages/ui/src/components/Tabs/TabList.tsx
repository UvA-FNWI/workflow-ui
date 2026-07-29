import { cloneElement, HTMLAttributes, ReactElement, RefObject } from 'react';

import { TabListState } from 'react-stately';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { TabProps } from './Tab';

const tabListClassGenerator = cva(
  'ui:flex ui:w-max ui:border-b ui:border-grey-500'
);

export type TabListProps = {
  // Only accepts Tab components as children
  children: Array<ReactElement<TabProps>>;
  activeIndex?: number;
  tabListProps?: HTMLAttributes<HTMLElement>;
  tabListRef?: RefObject<HTMLDivElement | null>;
  state?: TabListState<object>;
} & HTMLAttributes<HTMLDivElement>;

const TabList = ({
  children,
  className,
  activeIndex = 0,
  tabListProps,
  tabListRef,
  state,
  ...otherProps
}: TabListProps) => {
  return (
    <div className="ui:max-w-full ui:overflow-x-auto">
      <div
        className={cn(tabListClassGenerator(), className)}
        {...tabListProps}
        {...otherProps}
        ref={tabListRef}
      >
        {children.map((child, index) =>
          cloneElement(child, {
            key: index,
            isActive: index === activeIndex,
            item: { key: index.toString() },
            state,
          })
        )}
      </div>
    </div>
  );
};

export { TabList };
