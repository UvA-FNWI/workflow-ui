import { type ComponentProps, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../Icon';
import { Input } from './Input';

const commonArgTypes = {
  size: {
    control: {
      type: 'select' as const,
    },
    options: ['sm', 'md', 'lg'],
  },
  align: {
    control: {
      type: 'select' as const,
    },
    options: ['left', 'center'],
  },
};

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  argTypes: commonArgTypes,
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

export const WithLeftIcon: Story = {
  render: InteractiveInput,
  args: {
    label: 'Email',
    placeholder: 'Enter email address',
    leftIcon: <Icon name="email-solid" size="sm" />,
  },
};

export const WithRightIcon: Story = {
  render: InteractiveInput,
  args: {
    label: 'Search',
    placeholder: 'Search...',
    rightIcon: <Icon name="search-line" size="sm" />,
  },
};

export const WithBothIcons: Story = {
  render: InteractiveInput,
  args: {
    label: 'Website',
    placeholder: 'Enter URL',
    leftIcon: <Icon name="link-line" size="sm" />,
    rightIcon: <Icon name="square-info-line" size="sm" />,
  },
};

export const Sizes: Story = {
  args: {
    label: 'Input label',
    placeholder: 'Type something...',
  },
  render: args => {
    const sizes = ['sm', 'md', 'lg'] as const;
    return (
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
        {sizes.map(size => (
          <Input key={size} {...args} size={size} label={`Input (${size})`} />
        ))}
      </div>
    );
  },
};

export const Centered: Story = {
  render: InteractiveInput,
  args: {
    label: 'Grade',
    placeholder: '0',
    align: 'center',
    size: 'sm',
  },
};
