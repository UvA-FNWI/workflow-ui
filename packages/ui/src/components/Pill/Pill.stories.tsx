import type { Meta, StoryObj } from '@storybook/react';

import { Pill } from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Components/Pill',
  component: Pill,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The content of the pill (usually a number or short text)',
    },
    variant: {
      control: { type: 'select' },
      options: ['grey', 'red', 'green', 'orange', 'darkRed'],
      description: 'The visual style variant of the pill',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pill>;

export const Default: Story = {
  args: {
    children: '5',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Pill variant="darkRed">3</Pill>
      <Pill variant="red">Rejected</Pill>
      <Pill variant="green">Accepted</Pill>
      <Pill variant="orange">In progress</Pill>
      <Pill variant="grey">Waiting</Pill>
    </div>
  ),
};

export const Notifications: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Notifications</span>
        <Pill variant="darkRed">5</Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Messages</span>
        <Pill variant="grey">12</Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Updates</span>
        <Pill variant="grey">0</Pill>
      </div>
    </div>
  ),
};
