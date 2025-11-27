import {
  cloneElement,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  Ref,
  useImperativeHandle,
  useState,
} from 'react';

import { cva } from 'class-variance-authority';

import { Tab } from './Tab';
import { TabList, TabListProps } from './TabList';
import { TabPanel } from './TabPanel';
import { TabPanels, TabPanelsProps } from './TabPanels';
import { TabRef } from './TabRef';

const tabsClassGenerator = cva('Tabs');

type TabsProps = {
  // Only accepts TabList and TabPanels components as children
  children: Array<ReactElement<TabListProps | TabPanelsProps>>;
  className?: string;
  // Controlled component props
  activeIndex?: number; // If provided, component is controlled
  defaultActiveIndex?: number; // Default active index for uncontrolled mode
  onTabChange?: (index: number) => void; // Called when tab changes
};

const Tabs = forwardRef(
  (
    {
      children,
      className,
      activeIndex: controlledActiveIndex,
      defaultActiveIndex = 0,
      onTabChange,
    }: PropsWithChildren<TabsProps>,
    ref: Ref<TabRef>
  ) => {
    const tabList = children.find(
      child => child.type === TabList
    ) as ReactElement<TabListProps>;
    const tabPanels = children.find(
      child => child.type === TabPanels
    ) as ReactElement<TabPanelsProps>;

    // State - support both controlled and uncontrolled modes
    const [internalActiveIndex, setInternalActiveIndex] =
      useState<number>(defaultActiveIndex);

    // Determine if component is controlled
    const isControlled = controlledActiveIndex !== undefined;
    const activeIndex = isControlled
      ? controlledActiveIndex
      : internalActiveIndex;

    const executeCustomOnTabClick = (index: number) => {
      // Execute custom onTabClick if provided
      const onTabClick = tabList?.props.children[index].props.onTabClick;
      if (onTabClick) {
        onTabClick();
      }
    };

    const handleTabClick = (index: number) => {
      // Update internal state only if component is uncontrolled
      if (!isControlled) {
        setInternalActiveIndex(index);
      }

      // Always call onTabChange callback
      onTabChange?.(index);

      // Execute any custom tab click handlers
      executeCustomOnTabClick(index);
    };

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      goToTab: handleTabClick,
    }));

    return (
      <div className={tabsClassGenerator({ className })}>
        {tabList &&
          cloneElement(tabList, { activeIndex, onTabClick: handleTabClick })}
        {tabPanels && cloneElement(tabPanels, { activeIndex })}
      </div>
    );
  }
);

export { Tab, Tabs, TabList, TabPanels, TabPanel };
export type { TabsProps };
export { useTabsWithRouter, useTabsWithUrl } from './hooks/useTabsWithRouter';
