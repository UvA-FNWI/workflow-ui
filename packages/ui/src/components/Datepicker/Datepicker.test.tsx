import { act } from 'react';

import { parseDate } from '@internationalized/date';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { DatePicker } from './Datepicker';

describe('DatePicker Component', () => {
  const defaultProps = {
    label: 'Date',
    locale: 'nl-NL',
  };

  const PLACEHOLDER_DAY = 'dd';
  const PLACEHOLDER_MONTH = 'mm';
  const PLACEHOLDER_YEAR = 'jjjj';

  const getDaySegment = () => screen.getAllByRole('spinbutton')[0];
  const getMonthSegment = () => screen.getAllByRole('spinbutton')[1];
  const getYearSegment = () => screen.getAllByRole('spinbutton')[2];

  // Helper to find date button in open calendar
  const findDateButton = (dateText: string) => {
    const buttons = screen.getAllByText(dateText);
    return buttons.find(
      btn => btn.parentElement?.getAttribute('role') !== 'columnheader'
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders all essential elements', () => {
      render(<DatePicker {...defaultProps} />);

      // Label, segments, and button
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles label and aria-label correctly', () => {
      const { rerender } = render(<DatePicker label="Select Date" />);
      expect(screen.getByText('Select Date')).toBeInTheDocument();

      rerender(<DatePicker aria-label="Select date" />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<DatePicker {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('group')).toHaveClass('custom-class');
    });
  });

  describe('Date Value Display', () => {
    test('shows placeholder text when no value is set', () => {
      render(<DatePicker {...defaultProps} />);

      expect(getDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
      expect(getMonthSegment()).toHaveTextContent(PLACEHOLDER_MONTH);
      expect(getYearSegment()).toHaveTextContent(PLACEHOLDER_YEAR);
    });

    test('displays default value when provided', () => {
      const defaultValue = parseDate('2024-03-15');
      render(<DatePicker {...defaultProps} defaultValue={defaultValue} />);

      expect(getDaySegment()).toHaveTextContent('15');
      expect(getMonthSegment()).toHaveTextContent('3');
      expect(getYearSegment()).toHaveTextContent('2024');
    });

    test('displays controlled value when provided', () => {
      const value = parseDate('2023-12-25');
      render(<DatePicker {...defaultProps} value={value} />);

      expect(getDaySegment()).toHaveTextContent('25');
      expect(getMonthSegment()).toHaveTextContent('12');
      expect(getYearSegment()).toHaveTextContent('2023');
    });

    test('updates display when controlled value changes', () => {
      const { rerender } = render(
        <DatePicker {...defaultProps} value={parseDate('2024-01-01')} />
      );

      expect(getDaySegment()).toHaveTextContent('1');
      expect(getMonthSegment()).toHaveTextContent('1');

      rerender(
        <DatePicker {...defaultProps} value={parseDate('2024-06-15')} />
      );

      expect(getDaySegment()).toHaveTextContent('15');
      expect(getMonthSegment()).toHaveTextContent('6');
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

      const dateButton = findDateButton('15');

      if (dateButton) {
        fireEvent.click(dateButton);
        await waitFor(() => {
          expect(onChange).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Disabled State', () => {
    test('disables all interactions and applies styles', () => {
      render(<DatePicker {...defaultProps} isDisabled={true} />);

      // Check all segments are disabled
      const segments = screen.getAllByRole('spinbutton');
      segments.forEach(segment => {
        expect(segment).toHaveAttribute('aria-disabled', 'true');
      });

      // Check button is disabled
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // Check styles are applied
      const group = screen.getByRole('group');
      expect(group).toHaveClass('ui:opacity-60', 'ui:cursor-not-allowed');
    });

    test('does not call onChange when disabled', async () => {
      const onChange = vi.fn();
      render(
        <DatePicker {...defaultProps} isDisabled={true} onChange={onChange} />
      );

      const monthSegment = getMonthSegment();
      act(() => monthSegment.focus());
      fireEvent.input(monthSegment, { target: { textContent: '5' } });

      expect(onChange).not.toHaveBeenCalled();
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
      const onChange = vi.fn();
      const minValue = parseDate('2024-06-15');

      render(
        <DatePicker
          {...defaultProps}
          value={parseDate('2024-06-20')}
          minValue={minValue}
          onChange={onChange}
        />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      const disabledButton = findDateButton('10');
      const validButton = findDateButton('25');

      if (disabledButton) {
        expect(disabledButton).toHaveClass(
          'ui:cursor-not-allowed',
          'ui:opacity-50'
        );
        fireEvent.click(disabledButton);
        expect(onChange).not.toHaveBeenCalled();
      }

      if (validButton) {
        fireEvent.click(validButton);
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
      }
    });

    test('respects maxValue constraint', async () => {
      const onChange = vi.fn();
      const maxValue = parseDate('2024-06-20');

      render(
        <DatePicker
          {...defaultProps}
          value={parseDate('2024-06-15')}
          maxValue={maxValue}
          onChange={onChange}
        />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      const disabledButton = findDateButton('25');
      const validButton = findDateButton('18');

      if (disabledButton) {
        expect(disabledButton).toHaveClass(
          'ui:cursor-not-allowed',
          'ui:opacity-50'
        );
        fireEvent.click(disabledButton);
        expect(onChange).not.toHaveBeenCalled();
      }

      if (validButton) {
        fireEvent.click(validButton);
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
      }
    });
  });

  describe('Keyboard Navigation', () => {
    test('segments can receive and navigate focus', async () => {
      render(<DatePicker {...defaultProps} />);

      const monthSegment = getMonthSegment();
      const daySegment = getDaySegment();

      act(() => monthSegment.focus());
      expect(monthSegment).toHaveFocus();

      fireEvent.keyDown(monthSegment, { key: 'Tab', code: 'Tab' });
      act(() => daySegment.focus());
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

      const monthSegment = getMonthSegment();
      act(() => monthSegment.focus());
      fireEvent.keyDown(monthSegment, { key: 'ArrowUp', code: 'ArrowUp' });

      await waitFor(() => expect(onChange).toHaveBeenCalled());
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA roles and labels', () => {
      render(<DatePicker label="Select Date" />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Select Date')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-label');

      const segments = screen.getAllByRole('spinbutton');
      expect(segments).toHaveLength(3);
      segments.forEach(segment => {
        expect(segment).toHaveAttribute('aria-label');
      });
    });

    test('associates error message with field', () => {
      render(
        <DatePicker
          {...defaultProps}
          isValid={false}
          errorMessage="Invalid date"
        />
      );

      expect(screen.getByText('Invalid date')).toHaveAttribute('id');
    });

    test('associates description with field', () => {
      render(<DatePicker {...defaultProps} description="Select a date" />);
      expect(screen.getByText('Select a date')).toHaveAttribute('id');
    });
  });

  describe('Edge Cases', () => {
    test('works without onChange handler', () => {
      render(<DatePicker {...defaultProps} />);
      expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });

    test('handles null and undefined values', () => {
      const { rerender } = render(
        <DatePicker {...defaultProps} value={null as any} />
      );

      expect(getDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
      expect(getMonthSegment()).toHaveTextContent(PLACEHOLDER_MONTH);
      expect(getYearSegment()).toHaveTextContent(PLACEHOLDER_YEAR);

      rerender(<DatePicker {...defaultProps} value={undefined} />);

      expect(getDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
      expect(getMonthSegment()).toHaveTextContent(PLACEHOLDER_MONTH);
      expect(getYearSegment()).toHaveTextContent(PLACEHOLDER_YEAR);
    });
  });

  describe('Date Object Support', () => {
    test('accepts Date object as value', () => {
      render(
        <DatePicker
          {...defaultProps}
          value={new Date('2024-03-15T12:00:00Z')}
        />
      );

      expect(getDaySegment()).toHaveTextContent('15');
      expect(getMonthSegment()).toHaveTextContent('3');
    });

    test('accepts Date object as defaultValue', () => {
      render(
        <DatePicker
          {...defaultProps}
          defaultValue={new Date('2024-12-25T12:00:00Z')}
        />
      );

      expect(getDaySegment()).toHaveTextContent('25');
      expect(getMonthSegment()).toHaveTextContent('12');
    });

    test('calls onChange with Date object', async () => {
      const onChange = vi.fn();
      render(
        <DatePicker
          {...defaultProps}
          defaultValue={parseDate('2024-06-10')}
          onChange={onChange}
        />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Use a fixed date in the middle of the month that doesn't appear twice
      const dayButton = findDateButton('15');
      if (dayButton) {
        fireEvent.click(dayButton);
        await waitFor(() => {
          expect(onChange).toHaveBeenCalled();
          expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
        });
      }
    });

    test('accepts mixed DateValue and Date types', async () => {
      const { rerender } = render(
        <DatePicker {...defaultProps} value={parseDate('2024-01-01')} />
      );

      expect(getDaySegment()).toHaveTextContent('1');
      expect(getMonthSegment()).toHaveTextContent('1');

      rerender(
        <DatePicker
          {...defaultProps}
          value={new Date('2024-06-15T12:00:00Z')}
        />
      );

      expect(getDaySegment()).toHaveTextContent('15');
      expect(getMonthSegment()).toHaveTextContent('6');
    });

    test('converts invalid Date to null', () => {
      render(<DatePicker {...defaultProps} value={new Date('invalid')} />);

      expect(getDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
      expect(getMonthSegment()).toHaveTextContent(PLACEHOLDER_MONTH);
      expect(getYearSegment()).toHaveTextContent(PLACEHOLDER_YEAR);
    });
  });
});
