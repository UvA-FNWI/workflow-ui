import type { Meta, StoryObj } from '@storybook/react';

import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'The size of the loading spinner',
    },
    label: {
      control: 'text',
      description: 'Screen reader label for accessibility',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: {
    size: 'md',
    label: 'Loading...',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="ui:flex ui:items-center ui:gap-6 ui:p-4">
      <div className="ui:text-center">
        <LoadingSpinner size="xs" />
        <p className="ui:mt-2 ui:text-xs ui:text-grey-600">XS</p>
      </div>
      <div className="ui:text-center">
        <LoadingSpinner size="sm" />
        <p className="ui:mt-2 ui:text-xs ui:text-grey-600">SM</p>
      </div>
      <div className="ui:text-center">
        <LoadingSpinner size="md" />
        <p className="ui:mt-2 ui:text-xs ui:text-grey-600">MD</p>
      </div>
      <div className="ui:text-center">
        <LoadingSpinner size="lg" />
        <p className="ui:mt-2 ui:text-xs ui:text-grey-600">LG</p>
      </div>
      <div className="ui:text-center">
        <LoadingSpinner size="xl" />
        <p className="ui:mt-2 ui:text-xs ui:text-grey-600">XL</p>
      </div>
      <div className="ui:text-center">
        <LoadingSpinner size="2xl" />
        <p className="ui:mt-2 ui:text-xs ui:text-grey-600">2XL</p>
      </div>
    </div>
  ),
};

export const Accessibility: Story = {
  args: {
    size: 'md',
    label: 'Loading user profile data',
  },
  render: args => (
    <div className="ui:mx-auto ui:max-w-md ui:space-y-4 ui:p-6">
      <p className="ui:text-sm ui:text-grey-600">
        This spinner has a custom aria-label for screen readers:
      </p>
      <div className="ui:flex ui:items-center ui:justify-center ui:rounded ui:border ui:border-grey-200 ui:p-4">
        <LoadingSpinner {...args} />
      </div>
      <p className="ui:text-xs ui:text-grey-500">
        Screen readers will announce: "{args.label}"
      </p>
    </div>
  ),
};
