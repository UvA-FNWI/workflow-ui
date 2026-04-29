import { type ComponentProps, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
};

export default meta;

type Story = StoryObj<typeof TextArea>;

const InteractiveTextArea = (args: ComponentProps<typeof TextArea>) => {
  const [value, setValue] = useState(args.value ?? '');

  return <TextArea {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InteractiveTextArea,
  args: {
    label: 'Text area label',
    placeholder: 'Type a longer response...',
    description: 'This is a helper description for the textarea.',
    isDisabled: false,
    isValid: true,
  },
};

export const Invalid: Story = {
  render: InteractiveTextArea,
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
  render: InteractiveTextArea,
  args: {
    label: 'Disabled textarea',
    placeholder: 'Cannot type here',
    description: 'This textarea is disabled.',
    isDisabled: true,
    isValid: true,
  },
};

export const LongContent: Story = {
  render: InteractiveTextArea,
  args: {
    label: 'Long content',
    description: 'Use this state to review multiline editing behavior.',
    value:
      'First paragraph.\n\nSecond paragraph with additional detail.\n\nThird paragraph to exercise resizing and wrapping.',
    isDisabled: false,
    isValid: true,
  },
};
