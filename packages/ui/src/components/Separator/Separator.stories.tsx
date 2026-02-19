import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text/Text';
import { Separator } from './Separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: args => (
    <div className="w-64">
      <Text>Content above</Text>
      <Separator {...args} className="my-4" />
      <Text>Content below</Text>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: args => (
    <div className="flex h-32 items-center gap-4">
      <Text>Left content</Text>
      <Separator {...args} />
      <Text>Right content</Text>
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Text>Content above</Text>
      <Separator className="my-4" />
      <Text>Content below</Text>
    </div>
  ),
};
