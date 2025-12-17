import { useRef } from 'react';

import {
  AriaButtonProps,
  AriaCalendarProps,
  DateValue,
  useButton,
  useCalendar,
  useCalendarGrid,
  useLocale,
} from 'react-aria';
import { CalendarState, useCalendarState } from 'react-stately';

import { createCalendar } from '@internationalized/date';

import { Icon } from '../Icon';
import { CalendarCell } from './CalendarCell';

type CalendarProps = AriaCalendarProps<DateValue>;

// TODO: Replace with Button component
function NavButton(
  props: AriaButtonProps<'button'> & { children: React.ReactNode }
) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);

  return (
    <button
      {...buttonProps}
      ref={ref}
      className="ui:flex ui:h-8 ui:w-8 ui:items-center ui:justify-center ui:rounded ui:text-grey-700 ui:transition-colors ui:hover:bg-grey-200 ui:dark:text-grey-300 ui:dark:hover:bg-grey-800"
    >
      {props.children}
    </button>
  );
}

function CalendarGrid({ state }: { state: CalendarState }) {
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

export const Calendar: React.FC<CalendarProps> = props => {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  const ref = useRef<HTMLDivElement>(null);
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar(props, state);

  return (
    <div
      {...calendarProps}
      ref={ref}
      className="ui:inline-block ui:rounded-lg ui:bg-white ui:p-4 ui:shadow-lg ui:dark:bg-grey-900"
    >
      {/* Header with navigation */}
      <div className="ui:mb-4 ui:flex ui:items-center ui:justify-between">
        <NavButton {...prevButtonProps}>
          <Icon name="chevron-left-line" className="ui:h-5 ui:w-5" />
        </NavButton>
        <h2 className="ui:text-lg ui:font-semibold ui:text-black ui:dark:text-white">
          {title}
        </h2>
        <NavButton {...nextButtonProps}>
          <Icon name="chevron-right-line" className="ui:h-5 ui:w-5" />
        </NavButton>
      </div>
      {/* Calendar Grid */}
      <CalendarGrid state={state} />
    </div>
  );
};
