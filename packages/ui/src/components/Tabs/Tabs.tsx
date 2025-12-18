import {
  cloneElement,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useTab, useTabList, useTabPanel } from 'react-aria';
import { Item, useTabListState } from 'react-stately';

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

    const tabListRef = useRef<HTMLDivElement>(null);

    // Get tab items from children
    const tabs = tabList?.props.children || [];

    // Store custom onClick handlers
    const customHandlers = tabs.map(tab => tab.props.onTabClick);

    // Determine if component is controlled
    const isControlled = controlledActiveIndex !== undefined;

    // State management for controlled/uncontrolled behavior
    const [internalActiveIndex, setInternalActiveIndex] =
      useState(defaultActiveIndex);
    const activeIndex = isControlled
      ? controlledActiveIndex
      : internalActiveIndex;

    // Use react-stately for state management
    const state = useTabListState({
      children: tabs.map((tab, index) => (
        <Item key={index.toString()} textValue={`Tab ${index}`}>
          {tab.props.children}
        </Item>
      )),
      selectedKey: activeIndex?.toString(),
      onSelectionChange: key => {
        const index = parseInt(key.toString(), 10);

        // Update internal state if uncontrolled
        if (!isControlled) {
          setInternalActiveIndex(index);
        }

        // Call user's callback
        onTabChange?.(index);

        // Execute custom tab click handler
        const handler = customHandlers[index];
        if (handler) {
          handler();
        }
      },
    });

    // Use react-aria for accessibility
    const { tabListProps } = useTabList(
      {
        'aria-label': 'Tabs',
      },
      state,
      tabListRef
    );

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      goToTab: (index: number) => {
        if (!isControlled) {
          setInternalActiveIndex(index);
        }
        state.setSelectedKey(index.toString());
        onTabChange?.(index);

        // Execute custom handler
        const handler = customHandlers[index];
        if (handler) {
          handler();
        }
      },
    }));

    return (
      <div className={tabsClassGenerator({ className })}>
        {tabList &&
          cloneElement(tabList, {
            activeIndex,
            tabListProps,
            tabListRef,
            state,
          })}
        {tabPanels && cloneElement(tabPanels, { activeIndex, state })}
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

export { Tab, Tabs, TabList, TabPanels, TabPanel, useTab, useTabPanel };
export type { TabsProps };
export { useTabsWithRouter, useTabsWithUrl } from './hooks/useTabsWithRouter';
