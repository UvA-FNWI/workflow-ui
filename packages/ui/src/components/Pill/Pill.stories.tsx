import type { Meta, StoryObj } from '@storybook/react';

import { Pill } from './Pill';

const meta: Meta<typeof Pill> = {
  title: 'Components/Pill',
  component: Pill,
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
    type: {
      control: { type: 'select' },
      options: ['badge', 'pill'],
      description: 'The padding style of the pill',
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
      <Pill variant="darkRed" type="badge">
        3
      </Pill>
      <Pill variant="red" type="pill">
        Rejected
      </Pill>
      <Pill variant="green" type="pill">
        Accepted
      </Pill>
      <Pill variant="orange" type="pill">
        In progress
      </Pill>
      <Pill variant="grey" type="pill">
        Waiting
      </Pill>
    </div>
  ),
};

export const Notifications: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Notifications</span>
        <Pill variant="darkRed" type="badge">
          5
        </Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Messages</span>
        <Pill variant="grey" type="badge">
          12
        </Pill>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Updates</span>
        <Pill variant="grey" type="badge">
          0
        </Pill>
      </div>
    </div>
  ),
};
