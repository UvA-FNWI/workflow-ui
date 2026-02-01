import { getLocalTimeZone, parseDate } from '@internationalized/date';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { DateRangePicker } from './DateRangePicker';

describe('DateRangePicker Component', () => {
  const defaultProps = {
    label: 'Date Range',
    locale: 'nl-NL',
  };

  const PLACEHOLDER_DAY = 'dd';
  const PLACEHOLDER_MONTH = 'mm';
  const PLACEHOLDER_YEAR = 'jjjj';

  // Helper to get date segments (there are 6 for a range picker: start day/month/year + end day/month/year)
  const getStartDaySegment = () => screen.getAllByRole('spinbutton')[0];
  const getStartMonthSegment = () => screen.getAllByRole('spinbutton')[1];
  const getStartYearSegment = () => screen.getAllByRole('spinbutton')[2];
  const getEndDaySegment = () => screen.getAllByRole('spinbutton')[3];
  const getEndMonthSegment = () => screen.getAllByRole('spinbutton')[4];
  const getEndYearSegment = () => screen.getAllByRole('spinbutton')[5];

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
      render(<DateRangePicker {...defaultProps} />);

      // Label, segments (6 total), and button
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getAllByRole('spinbutton')).toHaveLength(6);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      render(<DateRangePicker {...defaultProps} className="custom-class" />);
      expect(screen.getByRole('group')).toHaveClass('custom-class');
    });
  });

  describe('Date Value Display', () => {
    test('shows placeholder text when no value is set', () => {
      render(<DateRangePicker {...defaultProps} />);

      // Start date placeholders
      expect(getStartDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
      expect(getStartMonthSegment()).toHaveTextContent(PLACEHOLDER_MONTH);
      expect(getStartYearSegment()).toHaveTextContent(PLACEHOLDER_YEAR);

      // End date placeholders
      expect(getEndDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
      expect(getEndMonthSegment()).toHaveTextContent(PLACEHOLDER_MONTH);
      expect(getEndYearSegment()).toHaveTextContent(PLACEHOLDER_YEAR);
    });

    test('displays default value when provided', () => {
      const defaultValue = {
        start: parseDate('2024-03-15').toDate(getLocalTimeZone()),
        end: parseDate('2024-03-25').toDate(getLocalTimeZone()),
      };
      render(<DateRangePicker {...defaultProps} defaultValue={defaultValue} />);

      expect(getStartDaySegment()).toHaveTextContent('15');
      expect(getStartMonthSegment()).toHaveTextContent('3');
      expect(getStartYearSegment()).toHaveTextContent('2024');

      expect(getEndDaySegment()).toHaveTextContent('25');
      expect(getEndMonthSegment()).toHaveTextContent('3');
      expect(getEndYearSegment()).toHaveTextContent('2024');
    });

    test('displays controlled value when provided', () => {
      const value = {
        start: parseDate('2023-12-20').toDate(getLocalTimeZone()),
        end: parseDate('2023-12-31').toDate(getLocalTimeZone()),
      };
      render(<DateRangePicker {...defaultProps} value={value} />);

      expect(getStartDaySegment()).toHaveTextContent('20');
      expect(getStartMonthSegment()).toHaveTextContent('12');
      expect(getEndDaySegment()).toHaveTextContent('31');
      expect(getEndMonthSegment()).toHaveTextContent('12');
    });

    test('updates display when controlled value changes', () => {
      const initialValue = {
        start: parseDate('2024-01-01').toDate(getLocalTimeZone()),
        end: parseDate('2024-01-15').toDate(getLocalTimeZone()),
      };
      const { rerender } = render(
        <DateRangePicker {...defaultProps} value={initialValue} />
      );

      expect(getStartDaySegment()).toHaveTextContent('1');
      expect(getEndDaySegment()).toHaveTextContent('15');

      const newValue = {
        start: parseDate('2024-06-10').toDate(getLocalTimeZone()),
        end: parseDate('2024-06-20').toDate(getLocalTimeZone()),
      };
      rerender(<DateRangePicker {...defaultProps} value={newValue} />);

      expect(getStartDaySegment()).toHaveTextContent('10');
      expect(getStartMonthSegment()).toHaveTextContent('6');
      expect(getEndDaySegment()).toHaveTextContent('20');
      expect(getEndMonthSegment()).toHaveTextContent('6');
    });
  });

  describe('Calendar Popover', () => {
    test('calendar is initially closed', () => {
      render(<DateRangePicker {...defaultProps} />);
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });

    test('opens calendar when calendar button is clicked', async () => {
      render(<DateRangePicker {...defaultProps} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    test('calendar displays current month when no value is set', async () => {
      render(<DateRangePicker {...defaultProps} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      const monthYearText = screen.getByRole('heading', { level: 2 });
      expect(monthYearText).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    test('calls onChange when dates are selected from calendar', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker {...defaultProps} onChange={onChange} />);

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Click first date (start)
      const startDateButton = findDateButton('10');
      if (startDateButton) {
        fireEvent.click(startDateButton);
      }

      // Click second date (end)
      const endDateButton = findDateButton('20');
      if (endDateButton) {
        fireEvent.click(endDateButton);
        await waitFor(() => {
          expect(onChange).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Disabled State', () => {
    test('disables all interactions and applies styles', () => {
      render(<DateRangePicker {...defaultProps} isDisabled={true} />);

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
  });

  describe('Validation State', () => {
    test('applies error styles when isValid is false', () => {
      render(<DateRangePicker {...defaultProps} isValid={false} />);

      const group = screen.getByRole('group');
      expect(group).toHaveClass('ui:border-red-600');
    });

    test('displays error message when provided and isValid is false', () => {
      render(
        <DateRangePicker
          {...defaultProps}
          isValid={false}
          errorMessage="Invalid date range"
        />
      );

      expect(screen.getByText('Invalid date range')).toBeInTheDocument();
    });

    test('does not display error message when isValid is true', () => {
      render(
        <DateRangePicker
          {...defaultProps}
          isValid={true}
          errorMessage="Invalid date range"
        />
      );

      expect(screen.queryByText('Invalid date range')).not.toBeInTheDocument();
    });

    test('displays description text when provided', () => {
      render(
        <DateRangePicker {...defaultProps} description="Select a date range" />
      );

      expect(screen.getByText('Select a date range')).toBeInTheDocument();
    });
  });

  describe('Date Constraints', () => {
    test('respects minValue constraint', async () => {
      const minValue = parseDate('2024-06-15');

      render(
        <DateRangePicker
          {...defaultProps}
          value={{
            start: parseDate('2024-06-20').toDate(getLocalTimeZone()),
            end: parseDate('2024-06-25').toDate(getLocalTimeZone()),
          }}
          minValue={minValue}
        />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      const disabledButton = findDateButton('10');
      if (disabledButton) {
        expect(disabledButton).toHaveClass(
          'ui:cursor-not-allowed',
          'ui:opacity-50'
        );
      }
    });

    test('respects maxValue constraint', async () => {
      const maxValue = parseDate('2024-06-20');

      render(
        <DateRangePicker
          {...defaultProps}
          value={{
            start: parseDate('2024-06-10').toDate(getLocalTimeZone()),
            end: parseDate('2024-06-15').toDate(getLocalTimeZone()),
          }}
          maxValue={maxValue}
        />
      );

      const calendarButton = screen.getByRole('button');
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      const disabledButton = findDateButton('25');
      if (disabledButton) {
        expect(disabledButton).toHaveClass(
          'ui:cursor-not-allowed',
          'ui:opacity-50'
        );
      }
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA roles and labels', () => {
      render(<DateRangePicker label="Select Date Range" />);

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByText('Select Date Range')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-label');

      // Should have 6 spinbuttons (3 for start, 3 for end)
      const segments = screen.getAllByRole('spinbutton');
      expect(segments).toHaveLength(6);
      segments.forEach(segment => {
        expect(segment).toHaveAttribute('aria-label');
      });
    });

    test('associates error message with field', () => {
      render(
        <DateRangePicker
          {...defaultProps}
          isValid={false}
          errorMessage="Invalid range"
        />
      );

      expect(screen.getByText('Invalid range')).toHaveAttribute('id');
    });

    test('associates description with field', () => {
      render(
        <DateRangePicker {...defaultProps} description="Select a range" />
      );
      expect(screen.getByText('Select a range')).toHaveAttribute('id');
    });
  });

  describe('Edge Cases', () => {
    test('works without onChange handler', () => {
      render(<DateRangePicker {...defaultProps} />);
      expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });

    test('handles null value', () => {
      render(<DateRangePicker {...defaultProps} value={null} />);

      expect(getStartDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
      expect(getEndDaySegment()).toHaveTextContent(PLACEHOLDER_DAY);
    });
  });

  describe('Date Object Support', () => {
    test('accepts Date objects as value', () => {
      render(
        <DateRangePicker
          {...defaultProps}
          value={{
            start: new Date('2024-03-15T12:00:00Z'),
            end: new Date('2024-03-25T12:00:00Z'),
          }}
        />
      );

      expect(getStartDaySegment()).toHaveTextContent('15');
      expect(getStartMonthSegment()).toHaveTextContent('3');
      expect(getEndDaySegment()).toHaveTextContent('25');
      expect(getEndMonthSegment()).toHaveTextContent('3');
    });

    test('accepts Date objects as defaultValue', () => {
      render(
        <DateRangePicker
          {...defaultProps}
          defaultValue={{
            start: new Date('2024-12-20T12:00:00Z'),
            end: new Date('2024-12-31T12:00:00Z'),
          }}
        />
      );

      expect(getStartDaySegment()).toHaveTextContent('20');
      expect(getStartMonthSegment()).toHaveTextContent('12');
      expect(getEndDaySegment()).toHaveTextContent('31');
      expect(getEndMonthSegment()).toHaveTextContent('12');
    });

    test('calls onChange with DateRange object', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker {...defaultProps} onChange={onChange} />);

      const calendarButton = screen.getByRole('button', { name: /kalender/i });
      fireEvent.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      // Select start date
      const startButton = findDateButton('10');
      if (startButton) {
        fireEvent.click(startButton);
      }

      // Select end date
      const endButton = findDateButton('20');
      if (endButton) {
        fireEvent.click(endButton);
        await waitFor(() => {
          expect(onChange).toHaveBeenCalled();
          const result = onChange.mock.calls[0][0];
          expect(result).toHaveProperty('start');
          expect(result).toHaveProperty('end');
          expect(result.start).toBeInstanceOf(Date);
          expect(result.end).toBeInstanceOf(Date);
        });
      }
    });
  });
});
