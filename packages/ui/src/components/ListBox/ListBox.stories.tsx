import { useState } from 'react';

import { Selection } from 'react-stately';

import type { Meta, StoryObj } from '@storybook/react';

import { ListBox } from './ListBox';
import { ListBoxItem } from './ListBoxItem';

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

const getSelectedItemNames = (selected: Selection) =>
  selected === 'all'
    ? 'All items'
    : Array.from(selected)
        .map(id => sampleItems.find(item => item.id === id)?.name)
        .join(', ');

const InteractiveListBox = ({ intent, className, ...args }: any) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  return (
    <div className="ui:max-w-md">
      <ListBox
        {...args}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        {state =>
          [...state.collection].map(item => {
            const value = item.value as ListItem;
            return (
              <ListBoxItem
                key={item.key}
                item={item}
                state={state}
                intent={intent}
                className={className}
              >
                <div className="ui:flex ui:items-center ui:gap-2">
                  <span className="ui:flex-1 ui:truncate">{value.name}</span>
                  {value.description && (
                    <span className="ui:flex-1 ui:truncate">
                      {value.description}
                    </span>
                  )}
                </div>
              </ListBoxItem>
            );
          })
        }
      </ListBox>
      <div className="ui:mt-4 ui:text-sm ui:text-black ui:dark:text-white">
        <strong>Selected:</strong> {getSelectedItemNames(selectedKeys)}
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
    'aria-label': 'Select multiple items',
  },
};

const disabledItems: ListItem[] = [
  { id: '1', name: 'Item One' },
  { id: '2', name: 'Item Two (disabled)' },
  { id: '3', name: 'Item Three' },
  { id: '4', name: 'Item Four (disabled)' },
  { id: '5', name: 'Item Five' },
];

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
        items={disabledItems}
      >
        {state =>
          [...state.collection].map(item => (
            <ListBoxItem key={item.key} item={item} state={state}>
              {(item.value as ListItem).name}
            </ListBoxItem>
          ))
        }
      </ListBox>
      <div className="ui:mt-4 ui:text-sm ui:text-black ui:dark:text-white">
        <strong>Selected:</strong> {getSelectedItemNames(selectedKeys)}
      </div>
    </div>
  );
};

export const DisabledItems: Story = {
  render: DisabledItemsComponent,
};

export const DangerSelectionVariant: Story = {
  render: InteractiveListBox,
  args: {
    items: sampleItems,
    selectionMode: 'single',
    'aria-label': 'Select a danger item',
    ...({ intent: 'danger' } as any),
    ...({ className: 'ui:border-b ui:border-grey-200' } as any),
  },
};
