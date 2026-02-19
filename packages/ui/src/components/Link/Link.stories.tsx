import type { Meta, StoryObj } from '@storybook/react-vite';

import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  args: {
    children: 'Visit documentation',
    href: '#',
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {};

export const Underlined: Story = {
  args: {
    underline: true,
  },
};

export const Secondary: Story = {
  args: {
    intent: 'secondary',
    underline: true,
    children: 'Secondary link',
  },
};

export const Destructive: Story = {
  args: {
    intent: 'destructive',
    underline: true,
    children: 'Remove item',
  },
};

export const InlineUsage: Story = {
  render: args => (
    <p className="ui:dark:ui:text-grey-200 ui:max-w-lg ui:text-sm ui:text-grey-800">
      You can place the <Link {...args}>Link component</Link> inline with text
      to provide contextual navigation or actions.
    </p>
  ),
  args: {
    intent: 'primary',
    underline: true,
  },
};
