import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ComboBox, ComboBoxItem, type ComboBoxProps } from './ComboBox';

describe('ComboBox', () => {
  type TestComboBoxProps = Omit<ComboBoxProps<object>, 'children'>;

  const renderComboBox = (props: Partial<TestComboBoxProps> = {}) =>
    render(
      <ComboBox label="Status" {...props}>
        <ComboBoxItem key="draft">Draft</ComboBoxItem>
        <ComboBoxItem key="review">In review</ComboBoxItem>
        <ComboBoxItem key="approved">Approved</ComboBoxItem>
      </ComboBox>
    );

  const openList = async () => {
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  };

  it('renders label and placeholder', () => {
    renderComboBox({ placeholder: 'Choose status' });

    expect(
      screen.getByText('Status', { selector: 'label[class]' })
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Choose status'
    );
  });

  it('opens options when the chevron is clicked', async () => {
    renderComboBox();

    await openList();

    expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'In review' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Approved' })
    ).toBeInTheDocument();
  });

  it('opens options from the input with ArrowDown', async () => {
    renderComboBox();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  it('calls onChange and updates the input when selecting an option', async () => {
    const onChange = vi.fn();
    renderComboBox({ onChange });

    await openList();

    fireEvent.click(screen.getByRole('option', { name: 'In review' }));

    expect(onChange).toHaveBeenCalledWith('review');
    expect(screen.getByRole('combobox')).toHaveValue('In review');
  });

  it('reopens the list when clicking the input after a selection', async () => {
    renderComboBox();

    await openList();
    fireEvent.click(screen.getByRole('option', { name: 'In review' }));

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'In review' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Approved' })
    ).toBeInTheDocument();
  });

  it('filters options as the user types', async () => {
    renderComboBox();

    const input = screen.getByRole('combobox');
    await openList();

    fireEvent.change(input, { target: { value: 'rev' } });

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'In review' })
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('option', { name: 'Draft' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Approved' })
    ).not.toBeInTheDocument();
  });

  it('shows noResults when the filter matches nothing', async () => {
    renderComboBox({ noResults: 'No results' });
    const input = screen.getByRole('combobox');
    await openList();
    fireEvent.change(input, { target: { value: 'zzz' } });
    await waitFor(() => {
      expect(screen.getByText('No results')).toBeInTheDocument();
    });
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('uses a custom noResults string', async () => {
    renderComboBox({ noResults: 'Niets gevonden' });
    await openList();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'zzz' },
    });
    await waitFor(() => {
      expect(screen.getByText('Niets gevonden')).toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: 'Niets gevonden' })
      ).toBeNull();
    });
  });

  it('supports disabled state', () => {
    renderComboBox({ isDisabled: true });

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('ui:cursor-not-allowed', 'ui:opacity-60');

    fireEvent.focus(input);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('applies custom className to the input', () => {
    renderComboBox({ className: 'custom-class' });

    expect(screen.getByRole('combobox')).toHaveClass('custom-class');
  });

  it('renders description and error message when invalid', () => {
    renderComboBox({
      description: 'Pick one status.',
      errorMessage: 'Status is required',
      isValid: false,
    });

    expect(screen.getByText('Pick one status.')).toBeInTheDocument();
    expect(screen.getByText('Status is required')).toBeInTheDocument();
  });
});
