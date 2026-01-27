import { useRef } from 'react';

import {
  AriaCalendarProps,
  AriaRangeCalendarProps,
  DateValue,
  useCalendar,
  useCalendarGrid,
  useLocale,
  useRangeCalendar,
} from 'react-aria';
import {
  CalendarState,
  RangeCalendarState,
  useCalendarState,
  useRangeCalendarState,
} from 'react-stately';

import { createCalendar } from '@internationalized/date';

import { Icon } from '../Icon';
import { CalendarNavButton } from './CalendarButton';
import { CalendarCell } from './CalendarCell';

/**
 * Shared calendar grid component that works with both single and range calendar states
 */
function CalendarGrid({
  state,
}: {
  state: CalendarState | RangeCalendarState;
}) {
  const { gridProps, headerProps, weekDays } = useCalendarGrid({}, state);

  return (
    <table {...gridProps} className="ui:w-full ui:border-collapse">
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th
              key={index}
              className="ui:h-10 ui:w-10 ui:text-sm ui:font-medium ui:text-grey-600 ui:dark:text-grey-400"
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, dayIndex) =>
                date ? (
                  <CalendarCell key={dayIndex} state={state} date={date} />
                ) : (
                  <td key={dayIndex} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Shared calendar layout wrapper
 */
interface CalendarLayoutProps {
  calendarProps: React.HTMLAttributes<HTMLDivElement>;
  onPressNext: () => void;
  onPressPrev: () => void;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  title: string;
  state: CalendarState | RangeCalendarState;
}

function CalendarLayout({
  calendarProps,
  onPressPrev,
  onPressNext,
  isPrevDisabled,
  isNextDisabled,
  title,
  state,
}: CalendarLayoutProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      {...calendarProps}
      ref={ref}
      className="ui:inline-block ui:rounded-lg ui:bg-white ui:p-4 ui:shadow-lg ui:dark:bg-grey-900"
    >
      {/* Header with navigation */}
      <div className="ui:mb-4 ui:flex ui:items-center ui:justify-between">
        <CalendarNavButton onPress={onPressPrev} isDisabled={isPrevDisabled}>
          <Icon name="chevron-left-line" className="ui:h-5 ui:w-5" />
        </CalendarNavButton>
        <h2 className="ui:text-lg ui:font-semibold ui:text-black ui:dark:text-white">
          {title}
        </h2>
        <CalendarNavButton onPress={onPressNext} isDisabled={isNextDisabled}>
          <Icon name="chevron-right-line" className="ui:h-5 ui:w-5" />
        </CalendarNavButton>
      </div>
      {/* Calendar Grid */}
      <CalendarGrid state={state} />
    </div>
  );
}

// Single Date Calendar
type CalendarProps = AriaCalendarProps<DateValue>;

export const Calendar: React.FC<CalendarProps> = props => {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar(props, state);

  return (
    <CalendarLayout
      calendarProps={calendarProps}
      onPressPrev={() => state.focusPreviousPage()}
      onPressNext={() => state.focusNextPage()}
      isPrevDisabled={prevButtonProps.isDisabled}
      isNextDisabled={nextButtonProps.isDisabled}
      title={title}
      state={state}
    />
  );
};

// Range Calendar
type RangeCalendarProps = AriaRangeCalendarProps<DateValue>;

export const RangeCalendar: React.FC<RangeCalendarProps> = props => {
  const { locale } = useLocale();
  const state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  const ref = useRef<HTMLDivElement>(null);
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useRangeCalendar(props, state, ref);

  return (
    <CalendarLayout
      calendarProps={calendarProps}
      onPressPrev={() => state.focusPreviousPage()}
      onPressNext={() => state.focusNextPage()}
      isPrevDisabled={prevButtonProps.isDisabled}
      isNextDisabled={nextButtonProps.isDisabled}
      title={title}
      state={state}
    />
  );
};
