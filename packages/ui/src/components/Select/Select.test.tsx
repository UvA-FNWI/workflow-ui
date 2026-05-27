import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Item, Select, type SelectProps } from './Select';

describe('Select', () => {
  type TestSelectProps = Omit<SelectProps<object>, 'children'>;

  const renderSelect = (props: Partial<TestSelectProps> = {}) =>
    render(
      <Select label="Status" {...props}>
        <Item key="draft">Draft</Item>
        <Item key="review">In review</Item>
        <Item key="approved">Approved</Item>
      </Select>
    );

  it('renders label and placeholder', () => {
    renderSelect({ placeholder: 'Choose status' });

    expect(
      screen.getByText('Status', { selector: 'label[class]' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Choose status');
  });

  it('opens options when trigger is clicked', async () => {
    renderSelect();

    fireEvent.click(screen.getByRole('button'));

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

  it('calls onChange and updates displayed value when selecting an option', async () => {
    const onChange = vi.fn();
    renderSelect({ onChange });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('option', { name: 'In review' }));

    expect(onChange).toHaveBeenCalledWith('review');
    expect(screen.getByRole('button')).toHaveTextContent('In review');
  });

  it('supports multiple selection mode and emits selected key arrays', async () => {
    const onChange = vi.fn();
    render(
      <Select<object, 'multiple'>
        label="Status"
        selectionMode="multiple"
        onChange={onChange}
      >
        <Item key="draft">Draft</Item>
        <Item key="review">In review</Item>
        <Item key="approved">Approved</Item>
      </Select>
    );

    const trigger = screen.getByRole('button', { name: /Status/ });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('option', { name: 'Draft' }));
    expect(onChange).toHaveBeenLastCalledWith(['draft']);

    fireEvent.click(screen.getByRole('option', { name: 'Approved' }));
    expect(onChange).toHaveBeenLastCalledWith(['draft', 'approved']);
    expect(trigger).toHaveTextContent('Draft, Approved');
  });

  it('renders comma-separated labels when multiple values are selected', () => {
    render(
      <Select<object, 'multiple'>
        label="Status"
        selectionMode="multiple"
        value={['draft', 'approved']}
      >
        <Item key="draft">Draft</Item>
        <Item key="review">In review</Item>
        <Item key="approved">Approved</Item>
      </Select>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Draft, Approved');
  });

  it('supports disabled state', () => {
    renderSelect({ isDisabled: true });

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('ui:cursor-not-allowed', 'ui:opacity-60');

    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('applies custom className to the trigger', () => {
    renderSelect({ className: 'custom-class' });

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('renders description and error message when invalid', () => {
    renderSelect({
      description: 'Pick one status.',
      errorMessage: 'Status is required',
      isValid: false,
    });

    expect(screen.getByText('Pick one status.')).toBeInTheDocument();
    expect(screen.getByText('Status is required')).toBeInTheDocument();
  });
});
