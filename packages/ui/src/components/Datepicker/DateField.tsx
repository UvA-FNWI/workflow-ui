import { useRef } from 'react';

import {
  AriaDateFieldProps,
  DateValue,
  useDateField,
  useDateSegment,
  useLocale,
} from 'react-aria';
import { DateFieldState, useDateFieldState } from 'react-stately';

import { createCalendar } from '@internationalized/date';

import { cn } from '../../utils/cn';

type DateSegmentType = DateFieldState['segments'][number];

interface DateSegmentProps {
  segment: DateSegmentType;
  state: DateFieldState;
}

function DateSegment({ segment, state }: DateSegmentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        'ui:rounded ui:px-1 ui:tabular-nums ui:outline-none ui:text-black ui:dark:text-white',
        'ui:focus:bg-navy-600 ui:focus:text-white ui:dark:focus:bg-sky-500',
        segment.isPlaceholder ? 'ui:text-grey-700 ui:dark:text-grey-400' : '',
        !segment.isEditable ? 'ui:text-grey-500' : ''
      )}
    >
      {segment.text}
    </div>
  );
}

interface DateFieldProps extends AriaDateFieldProps<DateValue> {
  className?: string;
}

export const DateField: React.FC<DateFieldProps> = props => {
  const { locale } = useLocale();
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  });

  const ref = useRef<HTMLDivElement>(null);
  const { fieldProps } = useDateField(props, state, ref);

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn('ui:inline-flex ui:gap-1 ui:text-base', props.className)}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </div>
  );
};
