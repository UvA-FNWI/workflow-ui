import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('adds trimmed custom values with Enter', () => {
    const onChange = vi.fn();
    render(<TagInput label="Topics" onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'Topics' });

    fireEvent.change(input, { target: { value: '  React  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenLastCalledWith(['React']);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('splits typed and pasted values using splitChars', () => {
    const onChange = vi.fn();
    render(<TagInput splitChars={[',', '|']} onChange={onChange} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: ',' });
    expect(onChange).toHaveBeenLastCalledWith(['React']);

    fireEvent.paste(input, {
      clipboardData: { getData: () => 'Vue | Svelte' },
    });
    expect(onChange).toHaveBeenLastCalledWith(['React', 'Vue', 'Svelte']);
  });

  it('accepts unfinished text on blur by default', () => {
    render(<TagInput />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.blur(input);

    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('can keep unfinished text on blur', () => {
    render(<TagInput acceptValueOnBlur={false} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.blur(input);

    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(input).toHaveValue('React');
  });

  it('rejects case-insensitive duplicates unless allowed', () => {
    const onDuplicate = vi.fn();
    const onChange = vi.fn();
    render(
      <TagInput
        defaultValue={['React']}
        onDuplicate={onDuplicate}
        onChange={onChange}
      />
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onDuplicate).toHaveBeenCalledWith('react');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByText(/react/i)).toHaveLength(1);
  });

  it('supports duplicate values when allowDuplicates is set', () => {
    render(<TagInput defaultValue={['React']} allowDuplicates />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getAllByText('React')).toHaveLength(2);
  });

  it('enforces maxTags and reports rejected values', () => {
    const onMaxTags = vi.fn();
    render(
      <TagInput defaultValue={['React']} maxTags={1} onMaxTags={onMaxTags} />
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Vue' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onMaxTags).toHaveBeenCalledWith('Vue');
    expect(screen.queryByText('Vue')).not.toBeInTheDocument();
    expect(input).toHaveValue('Vue');
  });

  it('removes the last tag with Backspace and tags with their remove buttons', () => {
    const onRemove = vi.fn();
    render(<TagInput defaultValue={['React', 'Vue']} onRemove={onRemove} />);
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onRemove).toHaveBeenCalledWith('Vue');
    expect(screen.queryByText('Vue')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(onRemove).toHaveBeenCalledWith('React');
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('filters and selects suggestions with the mouse', () => {
    render(<TagInput label="Libraries" data={['React', 'Vue', 'Svelte']} />);
    const input = screen.getByRole('combobox', { name: 'Libraries' });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'v' } });

    expect(screen.getByRole('option', { name: 'Svelte' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'React' })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'Vue' }));
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('stays open while using the suggestions scrollbar', () => {
    render(<TagInput data={['React', 'Vue', 'Svelte']} />);
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    const listbox = screen.getByRole('listbox');
    fireEvent.mouseDown(listbox);
    fireEvent.blur(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseUp(window);
    expect(input).toHaveFocus();
  });

  it('navigates and selects suggestions with the keyboard', () => {
    render(<TagInput data={['React', 'Vue']} />);
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const activeOption = screen.getByRole('option', { name: 'React' });
    expect(activeOption).toHaveAttribute('aria-selected', 'true');
    expect(activeOption).toHaveClass('ui:bg-grey-300');
    expect(activeOption).not.toHaveClass('ui:bg-navy-100');

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('clears all values and serializes values for forms', () => {
    const onClear = vi.fn();
    const { container } = render(
      <TagInput
        defaultValue={['React', 'Vue']}
        clearable
        name="topics"
        hiddenInputValuesDivider="|"
        onClear={onClear}
      />
    );

    expect(container.querySelector('input[type="hidden"]')).toHaveValue(
      'React|Vue'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear tags' }));

    expect(onClear).toHaveBeenCalledOnce();
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('');
  });

  it('supports controlled values and search text', () => {
    const onChange = vi.fn();
    const onSearchChange = vi.fn();
    render(
      <TagInput
        value={['React']}
        searchValue="Vue"
        onChange={onChange}
        onSearchChange={onSearchChange}
      />
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Svelte' } });
    expect(onSearchChange).toHaveBeenCalledWith('Svelte');

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

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Remove React' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Add relevant topics')).toBeInTheDocument();
    expect(
      screen.getByText('At least one topic is required')
    ).toBeInTheDocument();

    rerender(<TagInput readOnly defaultValue={['React']} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('readonly');
    expect(
      screen.queryByRole('button', { name: 'Remove React' })
    ).not.toBeInTheDocument();
  });
});
