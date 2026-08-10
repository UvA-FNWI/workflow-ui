import type { Meta, StoryObj } from '@storybook/react';

import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A neutral animated placeholder for content that is still loading. Set its dimensions with `className` and arrange multiple skeletons to approximate the final layout without implying real content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Classes that define the placeholder dimensions and shape.',
      table: { category: 'Styling' },
    },
    'aria-label': {
      control: 'text',
      description:
        'Optional accessible label. Usually the surrounding loading region should provide status text instead.',
      table: { category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: 'ui:h-6 ui:w-64',
  },
};

export const Shapes: Story = {
  render: () => (
    <div className="ui:flex ui:items-center ui:gap-6">
      <Skeleton className="ui:h-12 ui:w-12 ui:rounded-full" />
      <Skeleton className="ui:h-20 ui:w-32 ui:rounded-xs" />
      <Skeleton className="ui:h-6 ui:w-48 ui:rounded-full" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Dimensions and border radius can be adapted to avatars, media, badges, and other content shapes.',
      },
    },
  },
};

export const TextBlock: Story = {
  render: () => (
    <div className="ui:w-80 ui:space-y-3">
      <Skeleton className="ui:h-7 ui:w-2/3" />
      <Skeleton className="ui:h-4 ui:w-full" />
      <Skeleton className="ui:h-4 ui:w-full" />
      <Skeleton className="ui:h-4 ui:w-4/5" />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="ui:w-80 ui:rounded-xs ui:border ui:border-grey-300 ui:p-5 ui:dark:border-grey-700">
      <div className="ui:flex ui:items-center ui:gap-3">
        <Skeleton className="ui:h-12 ui:w-12 ui:rounded-full" />
        <div className="ui:flex-1 ui:space-y-2">
          <Skeleton className="ui:h-5 ui:w-2/3" />
          <Skeleton className="ui:h-4 ui:w-1/2" />
        </div>
      </div>
      <Skeleton className="ui:mt-5 ui:h-32 ui:w-full" />
    </div>
  ),
};
