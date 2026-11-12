import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('renders a native button with the aria-label as accessible name', () => {
    render(<IconButton icon="trash-line" aria-label="Delete item" />);

    const button = screen.getByRole('button', { name: 'Delete item' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('is keyboard operable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton
        icon="trash-line"
        aria-label="Delete item"
        onClick={onClick}
      />
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Delete item' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('forwards aria-expanded and other ARIA attributes', () => {
    render(
      <IconButton
        icon="chevron-down-line"
        aria-label="Open row for Jane"
        aria-expanded={false}
        aria-controls="row-1"
      />
    );

    const button = screen.getByRole('button', { name: 'Open row for Jane' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'row-1');
  });

  it('does not add an extra tab stop for the tooltip wrapper', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IconButton icon="trash-line" aria-label="Delete item" />
        <button>Next</button>
      </>
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Delete item' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });

  it('can render without tooltip', () => {
    const { container } = render(
      <IconButton icon="trash-line" aria-label="Delete item" tooltip={false} />
    );

    expect(container.firstElementChild?.tagName).toBe('BUTTON');
  });
});
