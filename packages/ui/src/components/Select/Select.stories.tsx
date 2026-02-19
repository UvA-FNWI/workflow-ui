import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Item, Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Select>;

const BasicSelect = (args: any) => (
  <div className="max-w-sm">
    <Select {...args}>
      <Item key="draft">Draft</Item>
      <Item key="review">In review</Item>
      <Item key="approved">Approved</Item>
      <Item key="published">Published</Item>
    </Select>
  </div>
);

export const Basic: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    placeholder: 'Select status',
  },
};

export const Disabled: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    defaultSelectedKey: 'review',
    isDisabled: true,
  },
};

const ControlledSelect = () => {
  const [value, setValue] = useState<string | null>('draft');

  return (
    <div className="max-w-sm space-y-4">
      <Select
        label="Status"
        selectedKey={value}
        onChange={key => setValue((key as string | null) ?? null)}
      >
        <Item key="draft">Draft</Item>
        <Item key="review">In review</Item>
        <Item key="approved">Approved</Item>
        <Item key="published">Published</Item>
      </Select>
      <div className="text-sm">
        <strong>Selected:</strong> {value ?? 'None'}
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: ControlledSelect,
};

export const WithDescriptionAndError: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    description: 'Pick the current workflow status.',
    errorMessage: 'Status is required',
    isValid: false,
  },
};

export const Multiple: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    selectionMode: 'multiple',
  },
};
