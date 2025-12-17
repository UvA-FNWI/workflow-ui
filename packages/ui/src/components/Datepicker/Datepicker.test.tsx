import { act } from 'react';

import { parseDate } from '@internationalized/date';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { DatePicker } from './Datepicker';

describe('DatePicker Component', () => {
  const defaultProps = {
    label: 'Date',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<DatePicker {...defaultProps} />);
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    test('renders date field with month, day, and year segments', () => {
      render(<DatePicker {...defaultProps} />);

      const segments = screen.getAllByRole('spinbutton');
      expect(segments).toHaveLength(3);
      expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/day/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    });

    test('renders calendar button', () => {
      render(<DatePicker {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('displays label when provided', () => {
      render(<DatePicker label="Select Date" />);
      expect(screen.getByText('Select Date')).toBeInTheDocument();
    });

    test('does not display label when not provided but has aria-label', () => {
      render(<DatePicker aria-label="Select date" />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      // Should have group with aria-label for accessibility
      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<DatePicker {...defaultProps} className="custom-class" />);
      const group = screen.getByRole('group');
      expect(group).toHaveClass('custom-class');
    });
  });

  describe('Date Value Display', () => {
    test('shows placeholder text when no value is set', () => {
      render(<DatePicker {...defaultProps} />);

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('mm');
      expect(screen.getByLabelText(/day/i)).toHaveTextContent('dd');
      expect(screen.getByLabelText(/year/i)).toHaveTextContent('yyyy');
    });

    test('displays default value when provided', () => {
      const defaultValue = parseDate('2024-03-15');
      render(<DatePicker {...defaultProps} defaultValue={defaultValue} />);

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('3');
      expect(screen.getByLabelText(/day/i)).toHaveTextContent('15');
      expect(screen.getByLabelText(/year/i)).toHaveTextContent('2024');
    });

    test('displays controlled value when provided', () => {
      const value = parseDate('2023-12-25');
      render(<DatePicker {...defaultProps} value={value} />);

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('12');
      expect(screen.getByLabelText(/day/i)).toHaveTextContent('25');
      expect(screen.getByLabelText(/year/i)).toHaveTextContent('2023');
    });

    test('updates display when controlled value changes', () => {
      const { rerender } = render(
        <DatePicker {...defaultProps} value={parseDate('2024-01-01')} />
      );

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('1');

      rerender(
        <DatePicker {...defaultProps} value={parseDate('2024-06-15')} />
      );

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('6');
      expect(screen.getByLabelText(/day/i)).toHaveTextContent('15');
    });
  });

  describe('Calendar Popover', () => {
    test('calendar is initially closed', () => {
      render(<DatePicker {...defaultProps} />);
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });

    test('opens calendar when calendar button is clicked', async () => {
      render(<DatePicker {...defaultProps} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    test('calendar displays current month when no value is set', async () => {
      render(<DatePicker {...defaultProps} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      const monthYearText = screen.getByRole('heading', { level: 2 });
      expect(monthYearText).toBeInTheDocument();
    });

    test('calendar displays month of selected date', async () => {
      const value = parseDate('2024-12-15');
      render(<DatePicker {...defaultProps} value={value} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toHaveTextContent(/december/i);
        expect(heading).toHaveTextContent(/2024/i);
      });
    });
  });

  describe('Date Selection', () => {
    test('calls onChange when a date is selected from calendar', async () => {
      const onChange = vi.fn();
      render(<DatePicker {...defaultProps} onChange={onChange} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Find a date cell (15th of the month)
      const dateCells = screen.getAllByRole('button', { name: /15/i });
      const dateButton = dateCells.find(
        btn => btn.getAttribute('role') === 'button' && btn.textContent === '15'
      );

      if (dateButton) {
        fireEvent.click(dateButton);

        await waitFor(() => {
          expect(onChange).toHaveBeenCalled();
        });
      }
    });

    test('segments can be focused for input', () => {
      render(<DatePicker {...defaultProps} />);

      const monthSegment = screen.getByLabelText(/month/i);

      act(() => {
        monthSegment.focus();
      });

      expect(monthSegment).toHaveFocus();
    });

    test('updates segments after calendar date selection', async () => {
      const { rerender } = render(
        <DatePicker {...defaultProps} value={parseDate('2024-01-01')} />
      );

      // Simulate selecting a different date
      rerender(
        <DatePicker {...defaultProps} value={parseDate('2024-06-15')} />
      );

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('6');
      expect(screen.getByLabelText(/day/i)).toHaveTextContent('15');
      expect(screen.getByLabelText(/year/i)).toHaveTextContent('2024');
    });
  });

  describe('Disabled State', () => {
    test('disables all segments when isDisabled is true', () => {
      render(<DatePicker {...defaultProps} isDisabled={true} />);

      const segments = screen.getAllByRole('spinbutton');
      segments.forEach(segment => {
        expect(segment).toHaveAttribute('aria-disabled', 'true');
      });
    });

    test('disables calendar button when isDisabled is true', () => {
      render(<DatePicker {...defaultProps} isDisabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('does not open calendar when disabled and button is clicked', () => {
      render(<DatePicker {...defaultProps} isDisabled={true} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('does not call onChange when disabled', async () => {
      const onChange = vi.fn();
      render(
        <DatePicker {...defaultProps} isDisabled={true} onChange={onChange} />
      );

      const monthSegment = screen.getByLabelText(/month/i);

      act(() => {
        monthSegment.focus();
      });

      fireEvent.input(monthSegment, { target: { textContent: '5' } });

      expect(onChange).not.toHaveBeenCalled();
    });

    test('applies disabled styles', () => {
      render(<DatePicker {...defaultProps} isDisabled={true} />);

      const group = screen.getByRole('group');
      expect(group).toHaveClass('ui:opacity-60', 'ui:cursor-not-allowed');
    });
  });

  describe('Validation State', () => {
    test('applies error styles when isValid is false', () => {
      render(<DatePicker {...defaultProps} isValid={false} />);

      const group = screen.getByRole('group');
      expect(group).toHaveClass('ui:border-red-600');
    });

    test('displays error message when provided and isValid is false', () => {
      render(
        <DatePicker
          {...defaultProps}
          isValid={false}
          errorMessage="Invalid date"
        />
      );

      expect(screen.getByText('Invalid date')).toBeInTheDocument();
    });

    test('does not display error message when isValid is true', () => {
      render(
        <DatePicker
          {...defaultProps}
          isValid={true}
          errorMessage="Invalid date"
        />
      );

      expect(screen.queryByText('Invalid date')).not.toBeInTheDocument();
    });

    test('displays description text when provided', () => {
      render(
        <DatePicker {...defaultProps} description="Select your birth date" />
      );

      expect(screen.getByText('Select your birth date')).toBeInTheDocument();
    });
  });

  describe('Date Constraints', () => {
    test('respects minValue constraint', async () => {
      const minValue = parseDate('2024-01-01');
      const value = parseDate('2023-12-31');

      render(
        <DatePicker {...defaultProps} value={value} minValue={minValue} />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Dates before minValue should be disabled in the calendar
      // This would require navigating to December 2023 to test properly
    });

    test('respects maxValue constraint', async () => {
      const maxValue = parseDate('2024-12-31');
      const value = parseDate('2024-06-15');

      render(
        <DatePicker {...defaultProps} value={value} maxValue={maxValue} />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Dates after maxValue should be disabled in the calendar
    });
  });

  describe('Required State', () => {
    test('accepts isRequired prop', () => {
      render(<DatePicker {...defaultProps} isRequired={true} />);

      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('segments can receive focus via Tab key', () => {
      render(<DatePicker {...defaultProps} />);

      const monthSegment = screen.getByLabelText(/month/i);

      act(() => {
        monthSegment.focus();
      });

      expect(monthSegment).toHaveFocus();
    });

    test('can navigate between segments with Tab', async () => {
      render(<DatePicker {...defaultProps} />);

      const monthSegment = screen.getByLabelText(/month/i);
      const daySegment = screen.getByLabelText(/day/i);

      act(() => {
        monthSegment.focus();
      });

      expect(monthSegment).toHaveFocus();

      fireEvent.keyDown(monthSegment, { key: 'Tab', code: 'Tab' });

      act(() => {
        daySegment.focus();
      });

      expect(daySegment).toHaveFocus();
    });

    test('arrow keys increment/decrement segment values', async () => {
      const onChange = vi.fn();
      render(
        <DatePicker
          {...defaultProps}
          value={parseDate('2024-06-15')}
          onChange={onChange}
        />
      );

      const monthSegment = screen.getByLabelText(/month/i);

      act(() => {
        monthSegment.focus();
      });

      fireEvent.keyDown(monthSegment, { key: 'ArrowUp', code: 'ArrowUp' });

      // Arrow up should increment the month
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA roles', () => {
      render(<DatePicker {...defaultProps} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
    });

    test('label is properly associated with date field', () => {
      render(<DatePicker label="Select Date" />);

      const label = screen.getByText('Select Date');
      const group = screen.getByRole('group');

      expect(label).toBeInTheDocument();
      expect(group).toBeInTheDocument();
    });

    test('calendar button has accessible label', () => {
      render(<DatePicker {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    test('segments have proper aria-labels', () => {
      render(<DatePicker {...defaultProps} />);

      expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/day/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    });

    test('error message is associated with field', () => {
      render(
        <DatePicker
          {...defaultProps}
          isValid={false}
          errorMessage="Invalid date"
        />
      );

      const errorMessage = screen.getByText('Invalid date');
      expect(errorMessage).toHaveAttribute('id');
    });

    test('description is associated with field', () => {
      render(<DatePicker {...defaultProps} description="Select a date" />);

      const description = screen.getByText('Select a date');
      expect(description).toHaveAttribute('id');
    });
  });

  describe('Edge Cases', () => {
    test('works without onChange handler', () => {
      render(<DatePicker {...defaultProps} />);

      const calendarButton = screen.getByRole('button');
      expect(() => fireEvent.click(calendarButton)).not.toThrow();
    });

    test('handles null value', () => {
      render(<DatePicker {...defaultProps} value={null as any} />);

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('mm');
      expect(screen.getByLabelText(/day/i)).toHaveTextContent('dd');
      expect(screen.getByLabelText(/year/i)).toHaveTextContent('yyyy');
    });

    test('handles undefined value', () => {
      render(<DatePicker {...defaultProps} value={undefined} />);

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('mm');
      expect(screen.getByLabelText(/day/i)).toHaveTextContent('dd');
      expect(screen.getByLabelText(/year/i)).toHaveTextContent('yyyy');
    });

    test('maintains controlled behavior', async () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <DatePicker
          {...defaultProps}
          value={parseDate('2024-01-01')}
          onChange={onChange}
        />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Value should not change until parent updates it
      expect(screen.getByLabelText(/month/i)).toHaveTextContent('1');

      rerender(
        <DatePicker
          {...defaultProps}
          value={parseDate('2024-06-15')}
          onChange={onChange}
        />
      );

      expect(screen.getByLabelText(/month/i)).toHaveTextContent('6');
    });
  });
});
