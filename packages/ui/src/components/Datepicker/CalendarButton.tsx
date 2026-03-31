import { Ref, useRef } from 'react';

import { AriaButtonProps, useButton } from 'react-aria';

import { Button } from '../Button/Button';
import { Icon } from '../Icon';

/**
 * Shared calendar trigger button used by DatePicker and DateRangePicker
 */
export function CalendarButton(
  props: AriaButtonProps<'button'> & {
    isDisabled?: boolean;
    ref?: Ref<HTMLButtonElement>;
  }
) {
  const internalRef = useRef<HTMLButtonElement>(null);
  const triggerRef = props.ref || internalRef;
  const { buttonProps } = useButton(props, internalRef);

  return (
    <Button
      intent="ghost"
      {...buttonProps}
      ref={triggerRef}
      className="ui:ml-2 ui:flex ui:h-6 ui:w-6 ui:items-center ui:justify-center ui:rounded ui:text-grey-600 ui:transition-colors ui:hover:text-navy-600 ui:dark:text-grey-400 ui:dark:hover:text-sky-500"
    >
      <Icon name="calendar-search-line" size="md" color="primary" />
    </Button>
  );
}

interface CalendarNavButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
}

/**
 * Shared navigation button for calendar month navigation
 */
export function CalendarNavButton({
  children,
  ...props
}: CalendarNavButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);

  return (
    <Button
      intent="ghost"
      {...buttonProps}
      ref={ref}
      className="ui:flex ui:h-8 ui:w-8 ui:items-center ui:justify-center ui:rounded ui:text-grey-700 ui:transition-colors ui:hover:bg-grey-200 ui:dark:text-grey-300 ui:dark:hover:bg-grey-800"
    >
      {children}
    </Button>
  );
}
