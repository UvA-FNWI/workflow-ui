import type { Meta, StoryObj } from '@storybook/react';

import { IconButton } from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icon-only button. It is always focusable and keyboard operable, and `aria-label` is required. By default the label is also shown as a tooltip. Use this instead of putting `onClick` on an `<Icon>`.',
      },
    },
  },
  argTypes: {
    intent: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
    },
    size: {
      control: { type: 'select' },
      options: ['square', 'square-small'],
    },
  },
  args: {
    icon: 'trash-line',
    'aria-label': 'Delete Assignment 1',
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'square-small', icon: 'edit-line', 'aria-label': 'Edit Exam' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};

export const Expandable: Story = {
  args: {
    icon: 'chevron-down-line',
    'aria-label': 'Open row for Jane Doe',
    'aria-expanded': false,
  },
};

export const WithoutTooltip: Story = {
  args: { tooltip: false },
};
