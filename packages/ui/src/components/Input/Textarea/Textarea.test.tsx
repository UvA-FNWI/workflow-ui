import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Textarea } from './Textarea';

describe('Textarea Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders a textarea instead of an input', () => {
    render(<Textarea label="Notes" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  test('calls onChange with the updated string value', () => {
    const onChange = vi.fn();
    render(<Textarea label="Notes" onChange={onChange} value="" />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Updated content' },
    });

    expect(onChange).toHaveBeenCalledWith('Updated content');
  });

  test('wires label, description, and error message correctly', () => {
    render(
      <Textarea
        label="Notes"
        description="Add more detail"
        errorMessage="This field is required"
        isValid={false}
      />
    );

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Add more detail')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('applies invalid and disabled styling correctly', () => {
    render(<Textarea aria-label="Notes" isDisabled={true} isValid={false} />);

    expect(screen.getByRole('textbox')).toHaveClass(
      'ui:cursor-not-allowed',
      'ui:opacity-60',
      'ui:border-red-600'
    );
  });

  test('forwards rows, maxLength, and custom className', () => {
    render(
      <Textarea
        aria-label="Notes"
        rows={6}
        maxLength={250}
        className="custom-textarea-class"
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '6');
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '250');
    expect(screen.getByRole('textbox')).toHaveClass(
      'custom-textarea-class',
      'ui:min-h-28',
      'ui:resize-y'
    );
  });
});
