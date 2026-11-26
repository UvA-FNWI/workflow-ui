import {
  CalendarDate,
  CalendarDateTime,
  DateValue,
  fromDate,
  getLocalTimeZone,
  toCalendarDate,
} from '@internationalized/date';

export type DateGranularity = 'day' | 'hour' | 'minute' | 'second';

/**
 * Converts a JavaScript Date to a react-aria DateValue.
 * Returns a CalendarDate for 'day' granularity, or a CalendarDateTime
 * for 'hour' | 'minute' | 'second' granularity.
 */
export function dateToDateValue(
  date: Date | null | undefined,
  granularity: DateGranularity = 'day'
): DateValue | null {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  const calendarDate = toCalendarDate(fromDate(date, getLocalTimeZone()));

  if (granularity === 'day') {
    return calendarDate;
  }

  return new CalendarDateTime(
    calendarDate.year,
    calendarDate.month,
    calendarDate.day,
    granularity === 'hour' ||
      granularity === 'minute' ||
      granularity === 'second'
      ? date.getHours()
      : 0,
    granularity === 'minute' || granularity === 'second'
      ? date.getMinutes()
      : 0,
    granularity === 'second' ? date.getSeconds() : 0
  );
}

/**
 * Converts a react-aria DateValue to a JavaScript Date
 */
export function dateValueToDate(
  dateValue: DateValue | null | undefined
): Date | null {
  if (!dateValue) {
    return null;
  }
  return dateValue.toDate(getLocalTimeZone());
}

/**
 * Date range type for public API
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Internal DateValue range type
 */
export interface DateValueRange {
  start: DateValue;
  end: DateValue;
}

/**
 * Converts a DateRange (with JS Dates) to a DateValueRange (with CalendarDates)
 */
export function dateRangeToDateValueRange(
  range: DateRange | null | undefined
): DateValueRange | null {
  if (!range) return null;
  const start = dateToDateValue(range.start);
  const end = dateToDateValue(range.end);
  if (!start || !end) return null;
  return { start, end };
}

/**
 * Converts a DateValueRange to a DateRange (with JS Dates)
 */
export function dateValueRangeToDateRange(
  range: { start: DateValue; end: DateValue } | null | undefined
): DateRange | null {
  if (!range) return null;
  return {
    start: dateValueToDate(range.start),
    end: dateValueToDate(range.end),
  };
}

/**
 * Checks if a given CalendarDate is today
 */
export function isToday(date: CalendarDate): boolean {
  try {
    const now = new Date();
    return (
      date.year === now.getFullYear() &&
      date.month === now.getMonth() + 1 &&
      date.day === now.getDate()
    );
  } catch {
    return false;
  }
}
