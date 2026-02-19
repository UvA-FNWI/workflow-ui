import type { Meta, StoryObj } from '@storybook/react-vite';

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
      options: ['grey', 'red'],
      description: 'The visual style variant of the pill',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '5',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Pill variant="grey">3</Pill>
      <Pill variant="red">7</Pill>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Pill variant="grey">New</Pill>
      <Pill variant="red">Hot</Pill>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Notifications</span>
        <Pill variant="red">5</Pill>
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
