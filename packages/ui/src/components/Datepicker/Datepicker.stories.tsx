import { useState } from 'react';

import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react';

import { DatePicker } from './Datepicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Date',
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Birth Date',
    defaultValue: parseDate('2000-01-01'),
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Select a date',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Event Date',
    description: 'Choose the date for your event',
  },
};

export const WithErrorMessage: Story = {
  args: {
    label: 'Date',
    errorMessage: 'Please select a valid date',
    isValid: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Date',
    isDisabled: true,
  },
};

export const WithMinMax: Story = {
  args: {
    label: 'Appointment Date',
    description: 'Select a date within the next 30 days',
    minValue: today(getLocalTimeZone()),
    maxValue: today(getLocalTimeZone()).add({ days: 30 }),
  },
};

export const Controlled: Story = {
  render: function ControlledDatePicker() {
    const [value, setValue] = useState<Date | null>(
      parseDate('2024-01-15').toDate(getLocalTimeZone())
    );

    return (
      <div className="ui:flex ui:flex-col ui:gap-4">
        <DatePicker
          label="Controlled Date Picker"
          value={value ?? undefined}
          onChange={newValue => setValue(newValue ?? null)}
        />
        <div className="ui:text-sm ui:text-grey-600">
          Selected date: {value?.toString() || 'None'}
        </div>
      </div>
    );
  },
};

export const Required: Story = {
  args: {
    label: 'Date of Birth',
    isRequired: true,
  },
};

export const MultipleStates: Story = {
  render: () => (
    <div className="ui:flex ui:flex-col ui:gap-6 ui:w-80">
      <DatePicker label="Default" />
      <DatePicker label="With Value" defaultValue={parseDate('2024-06-15')} />
      <DatePicker
        label="With Description"
        description="Select your preferred date"
      />
      <DatePicker
        label="Invalid"
        errorMessage="This date is not available"
        isValid={false}
      />
      <DatePicker label="Disabled" isDisabled={true} />
      <DatePicker label="Required" isRequired={true} />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    label: 'Date',
    defaultValue: parseDate('2024-06-15'),
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
