import { useRef } from 'react';

import {
  AriaCalendarCellProps,
  mergeProps,
  useCalendarCell,
  useFocusRing,
  useHover,
} from 'react-aria';
import { CalendarState, RangeCalendarState } from 'react-stately';

import { CalendarDate } from '@internationalized/date';
import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { isToday } from './utils';

// Type guard to check if state is a RangeCalendarState
function isRangeCalendarState(
  state: CalendarState | RangeCalendarState
): state is RangeCalendarState {
  return 'highlightedRange' in state;
}

const calendarCellVariants = cva(
  'ui:flex ui:h-10 ui:w-10 ui:items-center ui:justify-center ui:text-sm ui:transition-all ui:duration-200 ui:outline-none',
  {
    variants: {
      // Range-specific: whether this is the start of selection
      isSelectionStart: {
        true: 'ui:rounded-l-md',
        false: '',
      },
      // Range-specific: whether this is the end of selection
      isSelectionEnd: {
        true: 'ui:rounded-r-md',
        false: '',
      },
      // Single mode: full selection style. Range mode: interior of range
      isSelected: {
        true: '',
        false: 'ui:bg-transparent ui:text-black ui:dark:text-white',
      },
      // Range-specific: selection edge (start or end) gets prominent styling
      isSelectionEdge: {
        true: 'ui:bg-navy-600 ui:text-white ui:dark:bg-sky-500',
        false: '',
      },
      // Whether this is a single-date selection (not range)
      isSingleSelection: {
        true: '',
        false: '',
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
        true: '',
        false: '',
      },
      isFocusVisible: {
        true: 'ui:ring-navy-600 ui:dark:ring-offset-grey-900 ui:ring-2 ui:ring-offset-2 ui:dark:ring-orange-500 ui:rounded-md',
        false: '',
      },
    },
    compoundVariants: [
      // Single selection mode: full prominent style
      {
        isSelected: true,
        isSingleSelection: true,
        class: 'ui:bg-navy-600 ui:text-white ui:dark:bg-sky-500 ui:rounded-md',
      },
      // Single selection hover
      {
        isSelected: true,
        isSingleSelection: true,
        isHovered: true,
        class: 'ui:bg-navy-700 ui:dark:bg-sky-600',
      },
      // Range selection interior (not edge)
      {
        isSelected: true,
        isSingleSelection: false,
        isSelectionEdge: false,
        class:
          'ui:bg-navy-100 ui:text-navy-900 ui:dark:bg-sky-900 ui:dark:text-sky-100',
      },
      // Hover states for non-selected, non-disabled cells
      {
        isSelected: false,
        isHovered: true,
        isDisabled: false,
        class: 'ui:bg-navy-100 ui:dark:bg-sky-900 ui:rounded-md',
      },
      // Selection edge hover
      {
        isSelectionEdge: true,
        isHovered: true,
        class: 'ui:bg-navy-700 ui:dark:bg-sky-600',
      },
      // Today styling when not selected
      {
        isSelected: false,
        isToday: true,
        class:
          'ui:border ui:border-navy-600 ui:dark:border-sky-500 ui:text-navy-600 ui:dark:text-sky-500 ui:rounded-md',
      },
      // Outside month opacity
      {
        isOutsideMonth: true,
        isHovered: false,
        class: 'ui:opacity-40',
      },
    ],
    defaultVariants: {
      isSelectionStart: false,
      isSelectionEnd: false,
      isSelected: false,
      isSelectionEdge: false,
      isSingleSelection: true,
      isDisabled: false,
      isOutsideMonth: false,
      isToday: false,
      isHovered: false,
      isFocusVisible: false,
    },
  }
);

interface CalendarCellProps extends AriaCalendarCellProps {
  state: CalendarState | RangeCalendarState;
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
  const isTodayDate = isToday(date as CalendarDate);

  // Determine if we're in range mode and calculate range-specific props
  const isRangeMode = isRangeCalendarState(state);
  let isSelectionStart = false;
  let isSelectionEnd = false;
  let isSelectionEdge = false;

  if (isRangeMode) {
    const highlightedRange = state.highlightedRange;
    if (highlightedRange) {
      isSelectionStart = date.compare(highlightedRange.start) === 0;
      isSelectionEnd = date.compare(highlightedRange.end) === 0;
      isSelectionEdge = isSelectionStart || isSelectionEnd;
    }
  }

  const cellClasses = calendarCellVariants({
    isSelectionStart,
    isSelectionEnd,
    isSelected,
    isSelectionEdge,
    isSingleSelection: !isRangeMode,
    isDisabled,
    isOutsideMonth,
    isToday: isTodayDate,
    isHovered: isHovered && !isDisabled,
    isFocusVisible,
  });

  return (
    <td {...cellProps} className="ui:p-0">
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
