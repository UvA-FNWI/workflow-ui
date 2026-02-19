import { useState } from 'react';

import { Selection } from 'react-stately';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Item, ListBox } from './ListBox';

const meta: Meta<typeof ListBox> = {
  title: 'Components/ListBox',
  component: ListBox,
};

export default meta;

type Story = StoryObj<typeof ListBox>;

interface ListItem {
  id: string;
  name: string;
  description?: string;
}

const sampleItems: ListItem[] = [
  { id: '1', name: 'Item One', description: 'First item' },
  { id: '2', name: 'Item Two', description: 'Second item' },
  { id: '3', name: 'Item Three', description: 'Third item' },
  { id: '4', name: 'Item Four', description: 'Fourth item' },
  { id: '5', name: 'Item Five', description: 'Fifth item' },
];

const InteractiveListBox = (args: any) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  return (
    <div className="max-w-md">
      <ListBox
        {...args}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        {(item: ListItem) => (
          <Item key={item.id} textValue={item.name}>
            <div className="flex items-center justify-between">
              <span className="text-black dark:text-white">{item.name}</span>
              {item.description && (
                <span className="text-grey-600 dark:text-grey-400 text-sm">
                  {item.description}
                </span>
              )}
            </div>
          </Item>
        )}
      </ListBox>
      <div className="mt-4 text-sm">
        <strong>Selected:</strong>{' '}
        {selectedKeys === 'all'
          ? 'All items'
          : Array.from(selectedKeys).join(', ')}
      </div>
    </div>
  );
};

export const SingleSelection: Story = {
  render: InteractiveListBox,
  args: {
    items: sampleItems,
    selectionMode: 'single',
    'aria-label': 'Select an item',
  },
};

export const MultipleSelection: Story = {
  render: InteractiveListBox,
  args: {
    items: sampleItems,
    selectionMode: 'multiple',
    'aria-label': 'Select multiple items',
  },
};

export const WithManyItems: Story = {
  render: InteractiveListBox,
  args: {
    items: Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Item ${i + 1}`,
      description: `Description ${i + 1}`,
    })),
    selectionMode: 'single',
    'aria-label': 'Select from many items',
  },
};

const DisabledItemsComponent = () => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  return (
    <div className="max-w-md">
      <ListBox
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        disabledKeys={['2', '4']}
        aria-label="Select with disabled items"
      >
        <Item key="1">Item One</Item>
        <Item key="2">Item Two (disabled)</Item>
        <Item key="3">Item Three</Item>
        <Item key="4">Item Four (disabled)</Item>
        <Item key="5">Item Five</Item>
      </ListBox>
      <div className="mt-4 text-sm">
        <strong>Selected:</strong>{' '}
        {selectedKeys === 'all'
          ? 'All items'
          : Array.from(selectedKeys).join(', ')}
      </div>
    </div>
  );
};

export const DisabledItems: Story = {
  render: DisabledItemsComponent,
};
