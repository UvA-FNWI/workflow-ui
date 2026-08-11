import type { Meta, StoryObj } from '@storybook/react';

import { PageMark } from './PageMark';

const meta: Meta<typeof PageMark> = {
  title: 'Components/PageMark',
  component: PageMark,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    position: {
      control: 'select',
      options: ['fixed', 'absolute'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageMark>;

export const Primary: Story = {
  args: {
    label: 'tst',
    variant: 'primary',
    position: 'absolute',
  },
  decorators: [
    Story => (
      <div style={{ position: 'relative', height: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Secondary: Story = {
  args: {
    label: 'acc',
    variant: 'secondary',
    position: 'absolute',
  },
  decorators: [
    Story => (
      <div style={{ position: 'relative', height: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Tertiary: Story = {
  args: {
    label: 'dev',
    variant: 'tertiary',
    position: 'absolute',
  },
  decorators: [
    Story => (
      <div style={{ position: 'relative', height: '200px' }}>
        <Story />
      </div>
    ),
  ],
};
