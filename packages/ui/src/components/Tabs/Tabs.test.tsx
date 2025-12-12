import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tab, Tabs } from './Tabs';

describe('Tabs', () => {
  it('renders all tab titles', () => {
    render(
      <Tabs aria-label="Test tabs">
        <Tab title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab title="Tab 2">
          <div>Content 2</div>
        </Tab>
        <Tab title="Tab 3">
          <div>Content 3</div>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('renders the first tab content by default', () => {
    render(
      <Tabs aria-label="Test tabs">
        <Tab title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab title="Tab 2">
          <div>Content 2</div>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('renders the default selected tab content', () => {
    render(
      <Tabs defaultSelectedKey="tab2" aria-label="Test tabs">
        <Tab id="tab1" title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab id="tab2" title="Tab 2">
          <div>Content 2</div>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).not.toBeVisible();
  });

  it('switches content when clicking a different tab', () => {
    render(
      <Tabs aria-label="Test tabs">
        <Tab title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab title="Tab 2">
          <div>Content 2</div>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tab 2'));

    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('calls onSelectionChange when a tab is clicked', () => {
    const onSelectionChange = vi.fn();

    render(
      <Tabs onSelectionChange={onSelectionChange} aria-label="Test tabs">
        <Tab id="tab1" title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab id="tab2" title="Tab 2">
          <div>Content 2</div>
        </Tab>
      </Tabs>
    );

    fireEvent.click(screen.getByText('Tab 2'));

    expect(onSelectionChange).toHaveBeenCalledWith('tab2');
  });

  it('does not call onSelectionChange when clicking disabled tab', () => {
    const onSelectionChange = vi.fn();

    render(
      <Tabs onSelectionChange={onSelectionChange} aria-label="Test tabs">
        <Tab id="tab1" title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab id="tab2" title="Tab 2" isDisabled>
          <div>Content 2</div>
        </Tab>
      </Tabs>
    );

    // Clear any initial calls from mounting
    onSelectionChange.mockClear();

    fireEvent.click(screen.getByText('Tab 2'));

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('renders with controlled selection', () => {
    render(
      <Tabs selectedKey="tab3" aria-label="Test tabs">
        <Tab id="tab1" title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab id="tab2" title="Tab 2">
          <div>Content 2</div>
        </Tab>
        <Tab id="tab3" title="Tab 3">
          <div>Content 3</div>
        </Tab>
      </Tabs>
    );

    expect(screen.getByText('Content 3')).toBeInTheDocument();
  });

  it('has correct ARIA attributes for tabs', () => {
    render(
      <Tabs aria-label="Test tabs">
        <Tab title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab title="Tab 2">
          <div>Content 2</div>
        </Tab>
        <Tab title="Tab 3">
          <div>Content 3</div>
        </Tab>
      </Tabs>
    );

    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveAttribute('aria-label', 'Test tabs');

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    const tabPanel = screen.getByRole('tabpanel');
    expect(tabPanel).toBeInTheDocument();
  });

  it('marks selected tab with aria-selected', () => {
    render(
      <Tabs aria-label="Test tabs">
        <Tab title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab title="Tab 2">
          <div>Content 2</div>
        </Tab>
        <Tab title="Tab 3">
          <div>Content 3</div>
        </Tab>
      </Tabs>
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('applies vertical orientation class', () => {
    const { container } = render(
      <Tabs orientation="vertical" aria-label="Test tabs">
        <Tab title="Tab 1">
          <div>Content 1</div>
        </Tab>
        <Tab title="Tab 2">
          <div>Content 2</div>
        </Tab>
      </Tabs>
    );

    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveClass('ui:flex-col');
    expect(container.firstChild).toHaveClass('ui:flex');
  });
});
