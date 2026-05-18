import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Disclosure } from './Disclosure';

describe('Disclosure', () => {
  it('renders with closed state by default', () => {
    render(
      <Disclosure>
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    // Content is hidden by default with React Aria
    const content = screen.getByText('Content').parentElement;
    expect(content).toHaveAttribute('hidden');
  });

  it('renders with expanded state when defaultExpanded is true', () => {
    render(
      <Disclosure defaultExpanded>
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    const content = screen.getByText('Content').parentElement;
    expect(content).not.toHaveAttribute('hidden');
  });

  it('toggles content visibility when header is clicked', () => {
    render(
      <Disclosure>
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    const header = screen.getByRole('button');
    const content = screen.getByText('Content').parentElement;

    // Initially closed
    expect(content).toHaveAttribute('hidden', 'until-found');
    expect(header).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');

    // Click to close
    fireEvent.click(header);
    expect(content).toHaveAttribute('hidden', 'until-found');
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls onExpandedChange when toggled', () => {
    const handleExpandedChange = vi.fn();

    render(
      <Disclosure onExpandedChange={handleExpandedChange}>
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    const header = screen.getByRole('button');

    fireEvent.click(header);
    expect(handleExpandedChange).toHaveBeenCalledWith(true);

    fireEvent.click(header);
    expect(handleExpandedChange).toHaveBeenCalledWith(false);
  });

  it('works in controlled mode', () => {
    const handleExpandedChange = vi.fn();

    const { rerender } = render(
      <Disclosure isExpanded={false} onExpandedChange={handleExpandedChange}>
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    const content = screen.getByText('Content').parentElement;
    expect(content).toHaveAttribute('hidden', 'until-found');

    const header = screen.getByRole('button');
    fireEvent.click(header);

    // Should call onExpandedChange but not change state (controlled)
    expect(handleExpandedChange).toHaveBeenCalledWith(true);
    expect(content).toHaveAttribute('hidden', 'until-found');

    // Simulate parent updating the state
    rerender(
      <Disclosure isExpanded={true} onExpandedChange={handleExpandedChange}>
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    // When expanded, React Aria removes the hidden attribute
    expect(content).not.toHaveAttribute('hidden');
  });

  it('renders custom header content', () => {
    render(
      <Disclosure>
        <Disclosure.Header>
          <div>
            <h3>Title</h3>
            <p>Subtitle</p>
          </div>
        </Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('can hide the chevron icon', () => {
    render(
      <Disclosure>
        <Disclosure.Header showChevron={false}>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    // Check that the chevron icon is not rendered
    const header = screen.getByRole('button');
    const svgs = header.querySelectorAll('svg');
    expect(svgs).toHaveLength(0);
  });

  it('applies variant props correctly', () => {
    const { container } = render(
      <Disclosure padding="lg" shadow="lg" border="medium">
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    const disclosure = container.firstChild as HTMLElement;
    expect(disclosure).toHaveClass('ui:shadow-lg');
    expect(disclosure).toHaveClass('ui:border-2');
  });

  it('applies disabled prop correctly', () => {
    const { container } = render(
      <Disclosure isDisabled={true}>
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    const disclosure = container.firstChild as HTMLElement;
    expect(disclosure).toHaveClass('ui:opacity-40');
    expect(disclosure).toHaveClass('ui:cursor-not-allowed');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Disclosure className="custom-class">
        <Disclosure.Header>Header</Disclosure.Header>
        <Disclosure.Content>Content</Disclosure.Content>
      </Disclosure>
    );

    const disclosure = container.firstChild as HTMLElement;
    expect(disclosure).toHaveClass('custom-class');
  });

  it('throws error when Header is used outside of Disclosure', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<Disclosure.Header>Header</Disclosure.Header>);
    }).toThrow(
      'Disclosure sub-components must be used within a Disclosure component'
    );

    consoleSpy.mockRestore();
  });

  it('throws error when Content is used outside of Disclosure', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<Disclosure.Content>Content</Disclosure.Content>);
    }).toThrow(
      'Disclosure sub-components must be used within a Disclosure component'
    );

    consoleSpy.mockRestore();
  });
});
