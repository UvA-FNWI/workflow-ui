import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../Icon';
import { Pill } from './Pill';

const commonArgTypes = {
  type: {
    control: {
      type: 'select' as const,
    },
    options: ['error', 'warning', 'info'],
  },
  shape: {
    control: {
      type: 'select' as const,
    },
    options: ['circular', 'square'],
  },
  color: {
    control: {
      type: 'select' as const,
    },
    options: ['red', 'yellow', 'green', 'blue', 'purple', 'grey'],
  },
  tag: {
    control: {
      type: 'text' as const,
    },
  },
};

const meta: Meta<typeof Pill> = {
  title: 'Components/Pill',
  component: Pill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Pill>;

export const Default: Story = {
  args: {
    children: 'Default Pill',
    type: 'info',
    shape: 'circular',
  },
  argTypes: commonArgTypes,
};

export const WithTag: Story = {
  args: {
    children: 'Pill with tag',
    type: 'info',
    shape: 'circular',
    tag: 'NEW',
  },
  argTypes: commonArgTypes,
};

export const Error: Story = {
  args: {
    children: 'Error Pill',
    type: 'error',
    shape: 'circular',
  },
  argTypes: commonArgTypes,
};

export const Warning: Story = {
  args: {
    children: 'Warning Pill',
    type: 'warning',
    shape: 'circular',
  },
  argTypes: commonArgTypes,
};

export const Colors: Story = {
  args: {
    children: 'Color Pills',
    shape: 'circular',
  },
  argTypes: { shape: commonArgTypes.shape },
  render: props => {
    const colors = [
      'red',
      'yellow',
      'green',
      'blue',
      'purple',
      'grey',
    ] as const;
    return (
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {colors.map(color => (
          <Pill key={color} color={color} shape={props.shape}>
            {color}
          </Pill>
        ))}
      </div>
    );
  },
};

export const Shapes: Story = {
  args: {
    children: 'Shape Pills',
  },
  argTypes: { color: commonArgTypes.color },
  render: props => {
    const shapes = ['circular', 'square'] as const;
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {shapes.map(shape => (
          <Pill key={shape} color={props.color} shape={shape}>
            {shape}
          </Pill>
        ))}
      </div>
    );
  },
};

export const WithTags: Story = {
  args: {
    shape: 'circular',
  },
  argTypes: { shape: commonArgTypes.shape },
  render: props => {
    return (
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Pill color="yellow" shape={props.shape} tag="NEW">
          Feature Release
        </Pill>
        <Pill color="green" shape={props.shape} tag="✓">
          Completed
        </Pill>
        <Pill color="red" shape={'square'} tag="!">
          Square pill with tag
        </Pill>
      </div>
    );
  },
};

export const WithCustomIcon: Story = {
  args: {
    children: 'Custom Icon',
    color: 'blue',
    shape: 'circular',
    icon: <Icon name="clock-solid" size="xs" color="current" />,
  },
  argTypes: commonArgTypes,
};
