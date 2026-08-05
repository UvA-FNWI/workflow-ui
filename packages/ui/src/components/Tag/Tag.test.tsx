import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tag } from './Tag';

describe('Tag', () => {
  it('renders its content', () => {
    render(<Tag>React</Tag>);

    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('provides an accessible remove action', () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>React</Tag>);

    fireEvent.click(screen.getByRole('button', { name: 'Remove React' }));

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('hides the remove action when disabled', () => {
    render(
      <Tag isDisabled onRemove={() => undefined}>
        React
      </Tag>
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('React').parentElement).toHaveClass(
      'ui:opacity-60'
    );
  });
});
