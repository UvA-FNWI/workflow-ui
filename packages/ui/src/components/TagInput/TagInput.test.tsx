import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('adds trimmed custom values with Enter', () => {
    const onChange = vi.fn();
    render(<TagInput label="Topics" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Topics' });

    fireEvent.change(input, { target: { value: '  React  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenLastCalledWith(['React']);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('splits typed and pasted comma-separated values', () => {
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: ',' });
    expect(onChange).toHaveBeenLastCalledWith(['React']);

    fireEvent.paste(input, {
      clipboardData: { getData: () => 'Vue, Svelte' },
    });
    expect(onChange).toHaveBeenLastCalledWith(['React', 'Vue', 'Svelte']);
  });

  it('accepts unfinished text on blur by default', () => {
    render(<TagInput />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.blur(input);

    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('rejects case-insensitive duplicates', () => {
    const onChange = vi.fn();
    render(<TagInput defaultValue={['React']} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByText(/react/i)).toHaveLength(1);
  });

  it('removes the last tag with Backspace and tags with their remove buttons', () => {
    render(<TagInput defaultValue={['React', 'Vue']} />);
    const input = screen.getByRole('textbox');

    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(screen.queryByText('Vue')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('reports field clicks without treating tag removal as a field click', () => {
    const onControlClick = vi.fn();
    render(
      <TagInput defaultValue={['React']} onControlClick={onControlClick} />
    );
    const input = screen.getByRole('textbox');

    fireEvent.click(screen.getByText('React'));
    fireEvent.click(input.parentElement!);
    expect(onControlClick).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(onControlClick).toHaveBeenCalledTimes(2);
  });

  it('supports controlled values', () => {
    const onChange = vi.fn();
    render(<TagInput value={['React']} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Vue' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['React', 'Vue']);
  });

  it('supports disabled, read-only, description, and error states', () => {
    const { rerender } = render(
      <TagInput
        label="Topics"
        description="Add relevant topics"
        errorMessage="At least one topic is required"
        isValid={false}
        isDisabled
        defaultValue={['React']}
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Remove React' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Add relevant topics')).toBeInTheDocument();
    expect(
      screen.getByText('At least one topic is required')
    ).toBeInTheDocument();

    rerender(<TagInput readOnly defaultValue={['React']} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    expect(
      screen.queryByRole('button', { name: 'Remove React' })
    ).not.toBeInTheDocument();
  });
});
