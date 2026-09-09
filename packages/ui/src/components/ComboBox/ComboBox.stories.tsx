import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ComboBox, ComboBoxItem } from './ComboBox';
import type { ComboBoxProps } from './ComboBox';

const meta: Meta<typeof ComboBox> = {
  title: 'Components/ComboBox',
  component: ComboBox,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ComboBox>;

const BasicComboBox = (args: ComboBoxProps<object>) => (
  <div className="max-w-sm">
    <ComboBox {...args}>
      <ComboBoxItem key="draft">Draft</ComboBoxItem>
      <ComboBoxItem key="review">In review</ComboBoxItem>
      <ComboBoxItem key="approved">Approved</ComboBoxItem>
      <ComboBoxItem key="published">Published</ComboBoxItem>
    </ComboBox>
  </div>
);

export const Basic: Story = {
  render: BasicComboBox,
  args: {
    label: 'Status',
    placeholder: 'Search status',
  },
};

export const Disabled: Story = {
  render: BasicComboBox,
  args: {
    label: 'Status',
    defaultSelectedKey: 'review',
    isDisabled: true,
  },
};

const ControlledComboBox = () => {
  const [value, setValue] = useState<string | null>('draft');

  return (
    <div className="max-w-sm space-y-4">
      <ComboBox
        label="Status"
        value={value}
        onChange={key => setValue((key as string | null) ?? null)}
      >
        <ComboBoxItem key="draft">Draft</ComboBoxItem>
        <ComboBoxItem key="review">In review</ComboBoxItem>
        <ComboBoxItem key="approved">Approved</ComboBoxItem>
        <ComboBoxItem key="published">Published</ComboBoxItem>
      </ComboBox>
      <div className="text-sm">
        <strong>Selected:</strong> {value ?? 'None'}
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: ControlledComboBox,
};

export const WithDescriptionAndError: Story = {
  render: BasicComboBox,
  args: {
    label: 'Status',
    description: 'Pick the current workflow status.',
    errorMessage: 'Status is required',
    isValid: false,
  },
};

export const Filtering: Story = {
  render: (args: ComboBoxProps<object>) => (
    <div className="max-w-sm">
      <ComboBox {...args}>
        <ComboBoxItem key="amsterdam">Amsterdam</ComboBoxItem>
        <ComboBoxItem key="rotterdam">Rotterdam</ComboBoxItem>
        <ComboBoxItem key="utrecht">Utrecht</ComboBoxItem>
        <ComboBoxItem key="eindhoven">Eindhoven</ComboBoxItem>
        <ComboBoxItem key="groningen">Groningen</ComboBoxItem>
        <ComboBoxItem key="maastricht">Maastricht</ComboBoxItem>
      </ComboBox>
    </div>
  ),
  args: {
    label: 'City',
    placeholder: 'Type to filter',
    noResults: 'No results',
  },
};
