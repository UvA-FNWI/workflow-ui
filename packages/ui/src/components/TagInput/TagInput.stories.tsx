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
          'Captures a list of text values with optional suggestions. Users can submit custom tags with Enter, split values with commas, paste multiple values, navigate suggestions with the keyboard, and remove the final tag with Backspace. The component supports both controlled and uncontrolled state.',
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
  argTypes: {
    label: {
      control: 'text',
      description: 'Label shown above the field.',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Supporting text shown below the field.',
      table: { category: 'Content' },
    },
    errorMessage: {
      control: 'text',
      description: 'Error text shown when `isValid` is false.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder displayed in the text entry area.',
      table: { category: 'Content' },
    },
    data: {
      control: 'object',
      description:
        'Suggestions as strings, option objects, or grouped option objects. Custom values remain valid.',
      table: { category: 'Suggestions' },
    },
    limit: {
      control: { type: 'number', min: 1 },
      description: 'Maximum number of visible suggestions.',
      table: {
        category: 'Suggestions',
        defaultValue: { summary: 'Infinity' },
      },
    },
    openOnFocus: {
      control: 'boolean',
      description: 'Opens available suggestions when the field receives focus.',
      table: {
        category: 'Suggestions',
        defaultValue: { summary: 'true' },
      },
    },
    filter: {
      control: false,
      description: 'Custom suggestion filtering function.',
      table: { category: 'Suggestions' },
    },
    renderOption: {
      control: false,
      description: 'Custom suggestion renderer.',
      table: { category: 'Suggestions' },
    },
    value: {
      control: 'object',
      description: 'Controlled tag values.',
      table: { category: 'Value' },
    },
    defaultValue: {
      control: 'object',
      description: 'Initial values for an uncontrolled field.',
      table: { category: 'Value' },
    },
    searchValue: {
      control: 'text',
      description: 'Controlled text currently being entered.',
      table: { category: 'Value' },
    },
    defaultSearchValue: {
      control: 'text',
      description: 'Initial search text for an uncontrolled field.',
      table: { category: 'Value' },
    },
    onChange: {
      control: false,
      description: 'Called with the complete tag list after it changes.',
      table: { category: 'Events' },
    },
    onSearchChange: {
      control: false,
      description: 'Called when the text entry value changes.',
      table: { category: 'Events' },
    },
    onRemove: {
      control: false,
      description: 'Called with the value of a removed tag.',
      table: { category: 'Events' },
    },
    onClear: {
      control: false,
      description: 'Called after all tags are cleared.',
      table: { category: 'Events' },
    },
    onDuplicate: {
      control: false,
      description: 'Called when a duplicate value is submitted.',
      table: { category: 'Events' },
    },
    onMaxTags: {
      control: false,
      description: 'Called when a value exceeds the tag limit.',
      table: { category: 'Events' },
    },
    onOptionSubmit: {
      control: false,
      description: 'Called when a custom value or suggestion is accepted.',
      table: { category: 'Events' },
    },
    maxTags: {
      control: { type: 'number', min: 1 },
      description: 'Maximum number of accepted tags.',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'Infinity' },
      },
    },
    allowDuplicates: {
      control: 'boolean',
      description: 'Allows the same value to appear more than once.',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'false' },
      },
    },
    splitChars: {
      control: 'object',
      description: 'Characters that create and split tags.',
      table: {
        category: 'Behavior',
        defaultValue: { summary: "[',']" },
      },
    },
    acceptValueOnBlur: {
      control: 'boolean',
      description: 'Accepts unfinished text when focus leaves the field.',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'true' },
      },
    },
    clearable: {
      control: 'boolean',
      description: 'Shows a clear button when tags are present.',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'false' },
      },
    },
    isDuplicate: {
      control: false,
      description: 'Custom duplicate detection function.',
      table: { category: 'Behavior' },
    },
    isValid: {
      control: 'boolean',
      description: 'Controls invalid styling and error visibility.',
      table: {
        category: 'State',
        defaultValue: { summary: 'true' },
      },
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disables text entry and all tag actions.',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    readOnly: {
      control: 'boolean',
      description: 'Prevents changes while keeping the field focusable.',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Displays a loading indicator after the text field.',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Controls the field and tag size.',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'lg' },
      },
    },
    renderTag: {
      control: false,
      description: 'Custom selected-tag renderer.',
      table: { category: 'Appearance' },
    },
    className: {
      control: 'text',
      description: 'Classes applied to the field control.',
      table: { category: 'Styling' },
    },
    wrapperClassName: {
      control: 'text',
      description: 'Classes applied to the component wrapper.',
      table: { category: 'Styling' },
    },
    dropdownClassName: {
      control: 'text',
      description: 'Classes applied to the suggestions dropdown.',
      table: { category: 'Styling' },
    },
    tagClassName: {
      control: 'text',
      description: 'Classes applied to each default tag.',
      table: { category: 'Styling' },
    },
    hiddenInputValuesDivider: {
      control: 'text',
      description: 'Divider used by the hidden form input.',
      table: {
        category: 'Forms',
        defaultValue: { summary: ',' },
      },
    },
  },
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

export const WithSuggestions: Story = {
  args: {
    label: 'Libraries',
    description: 'Choose a suggestion or type a custom value.',
    placeholder: 'Pick or enter a library',
    data: ['React', 'Angular', 'Vue', 'Svelte'],
    defaultValue: ['React'],
    clearable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Suggestions are filtered as the user types and support mouse and arrow-key selection. Values are not limited to the suggestions.',
      },
    },
  },
};

export const GroupedSuggestions: Story = {
  args: {
    label: 'Technologies',
    placeholder: 'Choose or enter technologies',
    data: [
      { group: 'Frontend', items: ['React', 'Angular', 'Svelte'] },
      { group: 'Backend', items: ['Express', 'Django', 'Rails'] },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Suggestion data can be grouped. Selected suggestions are removed from the list unless duplicates are allowed.',
      },
    },
  },
};

export const MaximumTags: Story = {
  args: {
    label: 'Project topics',
    description: 'Add up to three topics.',
    placeholder: 'Enter a topic',
    defaultValue: ['Research', 'Education'],
    maxTags: 3,
    clearable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`maxTags` prevents additional values from being accepted. Use `onMaxTags` when the interface should report an attempted overflow.',
      },
    },
  },
};

export const CustomSeparators: Story = {
  args: {
    label: 'Keywords',
    description: 'Separate keywords with a comma, pipe, or space.',
    placeholder: 'accessibility | design systems',
    splitChars: [',', '|', ' '],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Configure `splitChars` to accept domain-specific separators. The same separators are used when text is pasted.',
      },
    },
  },
};

export const DuplicatesAllowed: Story = {
  args: {
    label: 'Votes',
    description: 'This example allows duplicate values.',
    placeholder: 'Enter a value more than once',
    defaultValue: ['React'],
    allowDuplicates: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Duplicate detection is case-insensitive by default. Set `allowDuplicates`, or provide `isDuplicate` for custom matching rules.',
      },
    },
  },
};

function ControlledExample() {
  const [value, setValue] = useState(['React']);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="ui:flex ui:flex-col ui:gap-3">
      <TagInput
        label="Controlled tag input"
        data={['React', 'Angular', 'Vue', 'Svelte']}
        value={value}
        onChange={setValue}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        clearable
      />
      <output className="ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
        Tags: {value.join(', ') || 'None'}
        <br />
        Search: {searchValue || 'Empty'}
      </output>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Control tags with `value` and `onChange`. The unfinished text can be controlled independently with `searchValue` and `onSearchChange`.',
      },
    },
  },
};

const optionDetails: Record<string, { emoji: string; description: string }> = {
  Apples: { emoji: '🍎', description: 'Crisp and juicy' },
  Bread: { emoji: '🍞', description: 'Freshly baked' },
  Bananas: { emoji: '🍌', description: 'Naturally sweet' },
};

export const CustomRendering: Story = {
  args: {
    label: 'Groceries',
    description: 'Suggestions and selected tags can both be customized.',
    placeholder: 'Choose groceries',
    data: Object.keys(optionDetails),
    defaultValue: ['Apples'],
    renderOption: ({ option }) => (
      <div className="ui:flex ui:items-center ui:gap-3">
        <span className="ui:text-xl">{optionDetails[option.value].emoji}</span>
        <span>
          <span className="ui:block ui:font-medium">{option.label}</span>
          <span className="ui:block ui:text-xs ui:text-grey-600 ui:dark:text-grey-400">
            {optionDetails[option.value].description}
          </span>
        </span>
      </div>
    ),
    renderTag: ({ value, onRemove, isDisabled }) => (
      <Tag
        isDisabled={isDisabled}
        onRemove={onRemove}
        className="ui:bg-forest-200 ui:text-forest-900 ui:dark:bg-forest-800 ui:dark:text-forest-100"
      >
        {optionDetails[value]?.emoji} {value}
      </Tag>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `renderOption` and `renderTag` when suggestions or selected values need richer presentation.',
      },
    },
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
      <TagInput
        label="Loading suggestions"
        placeholder="Search technologies"
        loading
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Disabled, read-only, invalid, and loading states use the same conventions as the other form components.',
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
