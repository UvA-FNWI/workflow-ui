import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Radio, RadioGroup, RadioGroupProps } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component: `
The RadioGroup component allows users to select a single option from a set of mutually exclusive choices.

## Features
- **Accessible**: Built with react-aria for full keyboard navigation and screen reader support
- **Controlled & Uncontrolled**: Supports both controlled (\`value\`/\`onChange\`) and uncontrolled (\`defaultValue\`) usage
- **Validation**: Built-in support for error states and error messages
- **Orientation**: Can be displayed vertically or horizontally
- **Disabled states**: Supports disabling the entire group or individual options

## Usage

\`\`\`tsx
import { RadioGroup, Radio } from '@workflow-ui/ui';

<RadioGroup
  label="Select your preference"
  value={selectedValue}
  onChange={setSelectedValue}
>
  <Radio value="option1">Option 1</Radio>
  <Radio value="option2">Option 2</Radio>
  <Radio value="option3">Option 3</Radio>
</RadioGroup>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the radio group',
    },
    description: {
      control: 'text',
      description: 'Description text shown below the label',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message shown when isValid is false',
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout orientation of radio items',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the entire radio group is disabled',
    },
    isValid: {
      control: 'boolean',
      description: 'Whether the radio group is in a valid state',
    },
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

type InteractiveProps = Omit<RadioGroupProps, 'children'> & {
  defaultValue?: string;
};

// Interactive wrapper for controlled stories
const InteractiveRadioGroup = ({
  defaultValue: initialValue,
  ...args
}: InteractiveProps) => {
  const [value, setValue] = useState(initialValue || '');

  return (
    <RadioGroup {...args} value={value} onChange={setValue}>
      <Radio value="option1">Option 1</Radio>
      <Radio value="option2">Option 2</Radio>
      <Radio value="option3">Option 3</Radio>
    </RadioGroup>
  );
};

/**
 * The default RadioGroup with vertical orientation.
 */
export const Default: Story = {
  render: InteractiveRadioGroup,
  args: {
    label: 'Select an option',
    description: 'Choose one of the available options below.',
    isDisabled: false,
    isValid: true,
    orientation: 'vertical',
  },
};

/**
 * RadioGroup with a pre-selected value.
 */
export const WithDefaultValue: Story = {
  render: InteractiveRadioGroup,
  args: {
    label: 'Select an option',
    defaultValue: 'option2',
    isDisabled: false,
    isValid: true,
    orientation: 'vertical',
  },
};

/**
 * RadioGroup displayed horizontally.
 */
export const Horizontal: Story = {
  render: InteractiveRadioGroup,
  args: {
    label: 'Select an option',
    orientation: 'horizontal',
    isDisabled: false,
    isValid: true,
  },
};

/**
 * Disabled RadioGroup - all options are disabled.
 */
export const Disabled: Story = {
  render: InteractiveRadioGroup,
  args: {
    label: 'Select an option',
    defaultValue: 'option1',
    isDisabled: true,
    isValid: true,
    orientation: 'vertical',
  },
};

/**
 * RadioGroup in an invalid state with error message.
 */
export const Invalid: Story = {
  render: InteractiveRadioGroup,
  args: {
    label: 'Select an option',
    errorMessage: 'Please select an option to continue.',
    isDisabled: false,
    isValid: false,
    orientation: 'vertical',
  },
};

// Component for disabled options story
const DisabledOptionsRadioGroup = ({
  defaultValue: initialValue,
  ...args
}: InteractiveProps) => {
  const [value, setValue] = useState(initialValue || '');

  return (
    <RadioGroup {...args} value={value} onChange={setValue}>
      <Radio value="available">Available option</Radio>
      <Radio value="disabled1" isDisabled>
        Disabled option 1
      </Radio>
      <Radio value="another">Another available option</Radio>
      <Radio value="disabled2" isDisabled>
        Disabled option 2
      </Radio>
    </RadioGroup>
  );
};

/**
 * RadioGroup with some options disabled individually.
 */
export const WithDisabledOptions: Story = {
  render: DisabledOptionsRadioGroup,
  args: {
    label: 'Select an option',
    description: 'Some options are disabled and cannot be selected.',
    isDisabled: false,
    isValid: true,
    orientation: 'vertical',
  },
};

/**
 * RadioGroup without a label - just the radio buttons.
 */
export const WithoutLabel: Story = {
  render: InteractiveRadioGroup,
  args: {
    isDisabled: false,
    isValid: true,
    orientation: 'vertical',
  },
};
