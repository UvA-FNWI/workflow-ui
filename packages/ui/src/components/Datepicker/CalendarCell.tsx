import { useRef } from 'react';

import {
  AriaCalendarCellProps,
  mergeProps,
  useCalendarCell,
  useFocusRing,
  useHover,
} from 'react-aria';
import { CalendarState } from 'react-stately';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const calendarCellVariants = cva(
  'ui:flex ui:h-10 ui:w-10 ui:items-center ui:justify-center ui:rounded-md ui:text-sm ui:transition-all ui:duration-200 ui:outline-none',
  {
    variants: {
      isSelected: {
        true: 'ui:bg-navy-600 ui:text-white ui:dark:bg-sky-500',
        false: 'ui:bg-transparent ui:text-black ui:dark:text-white',
      },
      isDisabled: {
        true: 'ui:text-grey-400 ui:cursor-not-allowed ui:opacity-50 ui:dark:text-grey-600',
        false: 'ui:cursor-pointer',
      },
      isOutsideMonth: {
        true: 'ui:text-grey-400 ui:dark:text-grey-600',
        false: '',
      },
      isToday: {
        true: 'ui:font-bold',
        false: '',
      },
      isHovered: {
        true: 'ui:bg-navy-100 ui:dark:bg-sky-900',
        false: '',
      },
      isFocusVisible: {
        true: 'ui:ring-navy-600 ui:dark:ring-offset-grey-900 ui:ring-2 ui:ring-offset-2 ui:dark:ring-orange-500',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        isHovered: true,
        class: 'ui:bg-navy-700 ui:dark:bg-sky-600',
      },
      {
        isSelected: false,
        isToday: true,
        class:
          'ui:border ui:border-navy-600 ui:dark:border-sky-500 ui:text-navy-600 ui:dark:text-sky-500',
      },
      {
        isOutsideMonth: true,
        isHovered: false,
        class: 'ui:opacity-40',
      },
    ],
    defaultVariants: {
      isSelected: false,
      isDisabled: false,
      isOutsideMonth: false,
      isToday: false,
      isHovered: false,
      isFocusVisible: false,
    },
  }
);

interface CalendarCellProps extends AriaCalendarCellProps {
  state: CalendarState;
}

export const CalendarCell: React.FC<CalendarCellProps> = ({ state, date }) => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
  } = useCalendarCell({ date }, state, ref);

  const { focusProps, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled });

  const isOutsideMonth = isOutsideVisibleRange;

  // Check if the date is today by comparing with current date
  const isToday = (() => {
    try {
      const now = new Date();
      const currentDate = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      };
      return (
        date.year === currentDate.year &&
        date.month === currentDate.month &&
        date.day === currentDate.day
      );
    } catch {
      return false;
    }
  })();

  const cellClasses = calendarCellVariants({
    isSelected,
    isDisabled,
    isOutsideMonth,
    isToday,
    isHovered: isHovered && !isDisabled,
    isFocusVisible,
  });

  return (
    <td {...cellProps}>
      <div
        {...mergeProps(buttonProps, focusProps, hoverProps)}
        ref={ref}
        className={cn(cellClasses)}
      >
        {formattedDate}
      </div>
    </td>
  );
};
