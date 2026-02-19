import { type ComponentProps, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
};

export default meta;

type Story = StoryObj<typeof NumberInput>;

const InteractiveNumberInput = (args: ComponentProps<typeof NumberInput>) => {
  const [value, setValue] = useState<number | undefined>(args.value);

  return <NumberInput {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InteractiveNumberInput,
  args: {
    label: 'Number input',
    placeholder: 'Enter a number',
    isDisabled: false,
    isValid: true,
  },
};

export const WithError: Story = {
  render: InteractiveNumberInput,
  args: {
    label: 'Number input with error',
    placeholder: 'Enter a number',
    description: 'This field is required and expects a valid number.',
    errorMessage: 'Please enter a valid number.',
    minValue: 0,
    maxValue: 10,
    step: 1,
    isDisabled: false,
    isValid: false,
  },
};

export const Disabled: Story = {
  render: InteractiveNumberInput,
  args: {
    label: 'Disabled number input',
    placeholder: 'Cannot edit this',
    minValue: 0,
    maxValue: 100,
    step: 1,
    isDisabled: true,
    isValid: true,
  },
};
