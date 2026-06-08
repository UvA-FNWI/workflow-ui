import { createRef } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Popover, usePopoverState } from './Popover';

vi.mock('react-aria', () => ({
  usePopover: vi.fn(() => ({
    popoverProps: { role: 'presentation' },
  })),
  Overlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Popover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPopover = (className?: string) => {
    const triggerRef = createRef<HTMLElement>() as React.RefObject<HTMLElement>;

    const Wrapper = () => {
      const state = usePopoverState();
      if (!state.isOpen) state.open();

      return (
        <Popover state={state} triggerRef={triggerRef} className={className}>
          <div>Popover content</div>
        </Popover>
      );
    };

    return render(<Wrapper />);
  };

  it('renders children when open', () => {
    renderPopover();

    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    renderPopover();

    expect(screen.getByRole('presentation')).toHaveClass(
      'ui:absolute',
      'ui:z-50',
      'ui:my-2'
    );
  });

  it('merges custom className with default classes', () => {
    renderPopover('custom-class');

    expect(screen.getByRole('presentation')).toHaveClass(
      'ui:absolute',
      'ui:z-50',
      'ui:my-2',
      'custom-class'
    );
  });
});

describe('usePopoverState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns closed state by default', () => {
    let state: ReturnType<typeof usePopoverState> | null = null;

    const TestComponent = () => {
      state = usePopoverState();
      return null;
    };

    render(<TestComponent />);
    expect(state!.isOpen).toBe(false);
  });

  it('can open and close', () => {
    let state: ReturnType<typeof usePopoverState> | null = null;

    const TestComponent = () => {
      state = usePopoverState();
      return (
        <>
          <button onClick={() => state!.open()}>Open</button>
          <button onClick={() => state!.close()}>Close</button>
        </>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Open'));
    expect(state!.isOpen).toBe(true);

    fireEvent.click(screen.getByText('Close'));
    expect(state!.isOpen).toBe(false);
  });
});
