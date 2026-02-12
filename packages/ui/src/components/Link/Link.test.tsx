import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Link } from './Link';

describe('Link', () => {
  it('renders an anchor with href and text', () => {
    render(<Link href="https://example.com">Example</Link>);
    const link = screen.getByRole('link', { name: 'Example' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies primary intent styles by default', () => {
    render(<Link href="#">Default</Link>);
    const link = screen.getByRole('link', { name: 'Default' });

    expect(link).toHaveClass('ui:cursor-pointer', 'ui:text-black');
  });

  it('applies underline variant', () => {
    render(
      <Link href="#" underline>
        Underlined
      </Link>
    );

    expect(screen.getByRole('link', { name: 'Underlined' })).toHaveClass(
      'ui:underline'
    );
  });

  it('invokes onClick handler', () => {
    const handleClick = vi.fn();
    render(
      <Link href="#" onClick={handleClick}>
        Clickable
      </Link>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Clickable' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
