import { type ComponentProps, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
};

export default meta;

type Story = StoryObj<typeof Textarea>;

const InteractiveTextarea = (args: ComponentProps<typeof Textarea>) => {
  const [value, setValue] = useState(args.value ?? '');

  return <Textarea {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InteractiveTextarea,
  args: {
    label: 'Textarea label',
    placeholder: 'Type a longer response...',
    description: 'This is a helper description for the textarea.',
    isDisabled: false,
    isValid: true,
  },
};

export const Invalid: Story = {
  render: InteractiveTextarea,
  args: {
    label: 'Invalid textarea',
    placeholder: 'Type a longer response...',
    description: 'This textarea has an error.',
    errorMessage: 'Please provide a valid value.',
    isDisabled: false,
    isValid: false,
  },
};

export const Disabled: Story = {
  render: InteractiveTextarea,
  args: {
    label: 'Disabled textarea',
    placeholder: 'Cannot type here',
    description: 'This textarea is disabled.',
    isDisabled: true,
    isValid: true,
  },
};

export const LongContent: Story = {
  render: InteractiveTextarea,
  args: {
    label: 'Long content',
    description: 'Use this state to review multiline editing behavior.',
    value:
      'First paragraph.\n\nSecond paragraph with additional detail.\n\nThird paragraph to exercise resizing and wrapping.',
    isDisabled: false,
    isValid: true,
  },
};
