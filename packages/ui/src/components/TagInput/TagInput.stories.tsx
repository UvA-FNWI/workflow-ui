import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Tag } from '../Tag';
import { TagInput } from './TagInput';

const meta: Meta<typeof TagInput> = {
  title: 'Components/TagInput',
  component: TagInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Captures free-form text values as tags. Enter, separators, paste, and blur can add values; Backspace removes the final tag. Supports controlled and uncontrolled state.',
      },
    },
  },
  decorators: [
    Story => (
      <div className="ui:w-[28rem] ui:max-w-[calc(100vw-2rem)]">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Default: Story = {
  args: {
    label: 'Press Enter to submit a tag',
    placeholder: 'Enter tag',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Type a value and press Enter. Commas and pasted comma-separated text also create tags.',
      },
    },
  },
};

function ControlledExample() {
  const [value, setValue] = useState(['React']);

  return (
    <div className="ui:flex ui:flex-col ui:gap-3">
      <TagInput
        label="Controlled tag input"
        value={value}
        onChange={setValue}
      />
      <output className="ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
        Tags: {value.join(', ') || 'None'}
      </output>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: {
    docs: {
      description: {
        story: 'Control tags with `value` and `onChange`.',
      },
    },
  },
};

export const CustomTags: Story = {
  args: {
    label: 'Groceries',
    defaultValue: ['Apples'],
    renderTag: ({ value, onRemove, isDisabled }) => (
      <Tag
        isDisabled={isDisabled}
        onRemove={onRemove}
        className="ui:bg-forest-200"
      >
        {value}
      </Tag>
    ),
  },
};

export const States: Story = {
  render: () => (
    <div className="ui:flex ui:flex-col ui:gap-6">
      <TagInput label="Disabled" defaultValue={['React']} isDisabled />
      <TagInput label="Read only" defaultValue={['React']} readOnly />
      <TagInput
        label="Invalid"
        description="Add at least one project topic."
        errorMessage="A project topic is required."
        isValid={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Disabled, read-only, and invalid states use the same conventions as the other form fields.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="ui:flex ui:flex-col ui:gap-6">
      <TagInput label="Small" size="sm" defaultValue={['React']} />
      <TagInput label="Medium" size="md" defaultValue={['React']} />
      <TagInput label="Large" size="lg" defaultValue={['React']} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Field and tag sizes stay aligned across all three size variants.',
      },
    },
  },
};
