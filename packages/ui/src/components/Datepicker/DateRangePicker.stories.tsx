import { useState } from 'react';

import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react';

import { DateRange, DateRangePicker } from './DateRangePicker';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Date Range',
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Booking Period',
    defaultValue: {
      start: parseDate('2024-06-01').toDate(getLocalTimeZone()),
      end: parseDate('2024-06-15').toDate(getLocalTimeZone()),
    },
  },
};

export const WithCustomLabels: Story = {
  args: {
    label: 'Trip Dates',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Event Duration',
    description: 'Select the start and end dates for your event',
  },
};

export const WithErrorMessage: Story = {
  args: {
    label: 'Date Range',
    errorMessage: 'Please select a valid date range',
    isValid: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Date Range',
    isDisabled: true,
    defaultValue: {
      start: parseDate('2024-06-01').toDate(getLocalTimeZone()),
      end: parseDate('2024-06-15').toDate(getLocalTimeZone()),
    },
  },
};

export const WithMinMax: Story = {
  args: {
    label: 'Booking Window',
    description: 'Select a date range within the next 60 days',
    minValue: today(getLocalTimeZone()),
    maxValue: today(getLocalTimeZone()).add({ days: 60 }),
  },
};

export const Controlled: Story = {
  render: function ControlledDateRangePicker() {
    const [range, setRange] = useState<DateRange | null>({
      start: parseDate('2024-06-01').toDate(getLocalTimeZone()),
      end: parseDate('2024-06-15').toDate(getLocalTimeZone()),
    });

    return (
      <div className="ui:flex ui:flex-col ui:gap-4">
        <DateRangePicker
          label="Controlled Date Range"
          value={range}
          onChange={newRange => setRange(newRange)}
        />
        <div className="ui:text-sm ui:text-grey-600">
          <div>Start: {range?.start?.toLocaleDateString() || 'None'}</div>
          <div>End: {range?.end?.toLocaleDateString() || 'None'}</div>
        </div>
      </div>
    );
  },
};

export const Required: Story = {
  args: {
    label: 'Reservation Period',
    isRequired: true,
  },
};

export const MultipleStates: Story = {
  render: () => (
    <div className="ui:flex ui:flex-col ui:gap-6 ui:w-96">
      <DateRangePicker label="Default" />
      <DateRangePicker
        label="With Value"
        defaultValue={{
          start: parseDate('2024-06-01').toDate(getLocalTimeZone()),
          end: parseDate('2024-06-15').toDate(getLocalTimeZone()),
        }}
      />
      <DateRangePicker
        label="With Description"
        description="Select your preferred date range"
      />
      <DateRangePicker
        label="Invalid"
        errorMessage="End date must be after start date"
        isValid={false}
      />
      <DateRangePicker label="Disabled" isDisabled={true} />
      <DateRangePicker label="Required" isRequired={true} />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    label: 'Date Range',
    defaultValue: {
      start: parseDate('2024-06-01').toDate(getLocalTimeZone()),
      end: parseDate('2024-06-15').toDate(getLocalTimeZone()),
    },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    Story => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
