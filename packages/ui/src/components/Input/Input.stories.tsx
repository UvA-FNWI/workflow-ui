import { type ComponentProps, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
};

export default meta;

type Story = StoryObj<typeof Input>;

const InteractiveInput = (args: ComponentProps<typeof Input>) => {
  const [value, setValue] = useState(args.value ?? '');

  return <Input {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InteractiveInput,
  args: {
    label: 'Input label',
    placeholder: 'Type something...',
    description: 'This is a helper description for the input.',
    isDisabled: false,
    isValid: true,
  },
};

export const Invalid: Story = {
  render: InteractiveInput,
  args: {
    label: 'Invalid input',
    placeholder: 'Type something...',
    description: 'This input has an error.',
    errorMessage: 'Please provide a valid value.',
    isDisabled: false,
    isValid: false,
  },
};

export const Disabled: Story = {
  render: InteractiveInput,
  args: {
    label: 'Disabled input',
    placeholder: 'Cannot type here',
    description: 'This input is disabled.',
    isDisabled: true,
    isValid: true,
  },
};
