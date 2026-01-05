import { createRef, useState } from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { TabRef } from './TabRef';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from './Tabs';

// Test component for controlled tabs
const ControlledTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Tabs activeIndex={activeIndex} onTabChange={setActiveIndex}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab disabled>Tab 3</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Content 1</TabPanel>
        <TabPanel>Content 2</TabPanel>
        <TabPanel>Content 3</TabPanel>
      </TabPanels>
    </Tabs>
  );
};

// Test component for uncontrolled tabs
const UncontrolledTabs = () => (
  <Tabs defaultActiveIndex={1}>
    <TabList>
      <Tab>Tab 1</Tab>
      <Tab>Tab 2</Tab>
      <Tab>Tab 3</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>Content 1</TabPanel>
      <TabPanel>Content 2</TabPanel>
      <TabPanel>Content 3</TabPanel>
    </TabPanels>
  </Tabs>
);

describe('Tabs', () => {
  test('renders in uncontrolled mode with default active tab', () => {
    render(<UncontrolledTabs />);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();

    // Second tab should be active (defaultActiveIndex={1})
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  test('handles controlled mode correctly', () => {
    render(<ControlledTabs />);

    // First tab should be active initially
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    // Click second tab
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  test('calls onTabChange callback', () => {
    const mockOnTabChange = vi.fn();

    render(
      <Tabs activeIndex={0} onTabChange={mockOnTabChange}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
        </TabPanels>
      </Tabs>
    );

    fireEvent.click(screen.getByText('Tab 2'));
    expect(mockOnTabChange).toHaveBeenCalledWith(1);
  });

  test('respects disabled tabs', () => {
    const mockOnTabChange = vi.fn();

    render(
      <Tabs activeIndex={0} onTabChange={mockOnTabChange}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab disabled>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
        </TabPanels>
      </Tabs>
    );

    fireEvent.click(screen.getByText('Tab 2'));
    expect(mockOnTabChange).not.toHaveBeenCalled();
  });

  test('exposes imperative handle methods', () => {
    const ref = createRef<TabRef>();
    const mockOnTabChange = vi.fn();

    render(
      <Tabs ref={ref} onTabChange={mockOnTabChange}>
        <TabList>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>Content 1</TabPanel>
          <TabPanel>Content 2</TabPanel>
        </TabPanels>
      </Tabs>
    );

    // Use imperative handle to go to tab
    act(() => {
      ref.current?.goToTab(1);
    });
    expect(mockOnTabChange).toHaveBeenCalledWith(1);
  });
});
