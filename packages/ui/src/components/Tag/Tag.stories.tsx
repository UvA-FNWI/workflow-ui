import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from './Tag';

const meta = {
  title: 'Internal/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '⚠️ **Warning:** Do not use `Tag` directly in application code.\n\n `Tag` is an internal building block for `TagInput`.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content displayed inside the tag.',
      table: { category: 'Content' },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Controls the height, padding, and text size.',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'md' },
      },
    },
    isDisabled: {
      control: 'boolean',
      description: 'Dims the tag and hides its remove action.',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    onRemove: {
      control: false,
      description: 'Shows a remove button and runs when it is activated.',
      table: { category: 'Events' },
    },
    removeLabel: {
      control: 'text',
      description:
        'Accessible name for the remove button. String content defaults to “Remove {content}”.',
      table: { category: 'Accessibility' },
    },
    className: {
      control: 'text',
      description: 'Additional classes applied to the tag root.',
      table: { category: 'Styling' },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'React',
    size: 'md',
    isDisabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default rendering used internally for values managed by `TagInput`.',
      },
    },
  },
};

function RemovableExample() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Storybook']);

  return tags.length > 0 ? (
    <div className="ui:flex ui:flex-wrap ui:items-center ui:gap-2">
      {tags.map(tag => (
        <Tag
          key={tag}
          onRemove={() => setTags(value => value.filter(item => item !== tag))}
        >
          {tag}
        </Tag>
      ))}
    </div>
  ) : (
    <span className="ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
      All tags removed
    </span>
  );
}

export const Removable: Story = {
  args: {
    children: 'Removable tag',
  },
  render: () => <RemovableExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Providing `onRemove` displays a remove button. Try removing the tags with a mouse or keyboard.',
      },
    },
  },
};

export const Sizes: Story = {
  args: {
    children: 'Tag',
  },
  render: () => (
    <div className="ui:flex ui:items-center ui:gap-3">
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
      <Tag size="lg">Large</Tag>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Three sizes are available to match compact controls and larger input layouts.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    children: 'Read only',
    onRemove: () => undefined,
    isDisabled: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Disabled tags remain visible but do not expose the remove action.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    children: 'Custom tag',
    onRemove: () => undefined,
    className:
      'ui:bg-forest-200 ui:text-forest-900 ui:dark:bg-forest-800 ui:dark:text-forest-100',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Verifies that `TagInput` can adapt its internal tag styling through `className`.',
      },
    },
  },
};
