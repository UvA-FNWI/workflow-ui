import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../Icon';
import { Button } from './Button';

const commonArgTypes = {
  intent: {
    control: {
      type: 'select' as const,
    },
    options: ['primary', 'secondary', 'ghost'],
  },
  variant: {
    control: {
      type: 'select' as const,
    },
    options: ['default', 'destructive'],
  },
  size: {
    control: {
      type: 'select' as const,
    },
    options: ['small', 'medium', 'large'],
  },
  shape: {
    control: {
      type: 'select' as const,
    },
    options: ['circular', 'square'],
  },
  disabled: {
    control: {
      type: 'boolean' as const,
    },
  },
  width: {
    control: {
      type: 'select' as const,
    },
    options: ['full', 'regular'],
  },
};

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Regular: Story = {
  args: {
    intent: 'primary',
    size: 'small',
    children: 'Button',
  },
  argTypes: commonArgTypes,
};

export const Disabled: Story = {
  args: {
    intent: 'primary',
    size: 'small',
    children: 'Button',
    disabled: true,
  },
  argTypes: commonArgTypes,
};

export const RegularIcon: Story = {
  args: {
    intent: 'primary',
    size: 'medium',
    children: 'Button with icon',
    rightIcon: <Icon name="arrow-right-line" size="md" color="current" />,
  },
  argTypes: commonArgTypes,
};

export const Loading: Story = {
  args: {
    intent: 'primary',
    size: 'large',
    children: 'Button',
    isLoading: true,
  },
  argTypes: commonArgTypes,
};

export const FullWidth: Story = {
  args: {
    intent: 'primary',
    size: 'large',
    children: 'Button',
    width: 'full',
  },
  argTypes: commonArgTypes,
  parameters: {
    layout: 'padded',
  },
};

export const Sizes: Story = {
  args: {
    intent: 'primary',
    children: 'Button',
    isLoading: false,
    disabled: false,
  },
  argTypes: { intent: commonArgTypes.intent },
  render: props => {
    const sizes = ['small', 'medium', 'large'] as const;
    return (
      <div style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
        {sizes.map(size => (
          <Button
            intent={props.intent}
            size={size}
            shape={props.shape}
            isLoading={props.isLoading}
            disabled={props.disabled}
          >
            Button
          </Button>
        ))}
      </div>
    );
  },
};

export const Ghost: Story = {
  args: {
    intent: 'ghost',
    size: 'medium',
    children: 'Ghost Button',
  },
  argTypes: commonArgTypes,
};

export const DestructiveGhost: Story = {
  args: {
    intent: 'ghost',
    variant: 'destructive',
    size: 'medium',
    children: 'Destructive ghost Button',
  },
  argTypes: commonArgTypes,
};

export const GhostWithIcon: Story = {
  args: {
    intent: 'ghost',
    size: 'small',
    rightIcon: <Icon name="edit-line" size="xs" color="danger" />,
  },
  argTypes: commonArgTypes,
};
