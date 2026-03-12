import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { SearchListBox, SearchListBoxValue } from './SearchListBox';

const meta: Meta<typeof SearchListBox> = {
  title: 'Components/SearchListBox',
  component: SearchListBox,
};

export default meta;

type Story = StoryObj<typeof SearchListBox>;

const sampleValues: SearchListBoxValue[] = [
  {
    key: '1',
    primaryValue: 'Henk de Vries',
    secondaryValue:
      'Faculteit der Natuurwetenschappen, Wiskunde en Informatica',
  },
  {
    key: '2',
    primaryValue: 'Ariel Stokes',
    secondaryValue: 'Faculteit der Geneeskunde',
  },
  {
    key: '3',
    primaryValue: 'Cara Rivera',
    secondaryValue: 'Faculteit der Geesteswetenschappen',
  },
  {
    key: '4',
    primaryValue: 'Johanna de Jonge',
    secondaryValue: 'Faculteit der Rechtsgeleerdheid',
  },
  {
    key: '5',
    primaryValue: 'Alfred Stephens',
    secondaryValue: 'Economie en Bedrijfskunde',
  },
];

const InteractiveSearchListBox = (args: any) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  return (
    <div className="max-w-md">
      <SearchListBox
        {...args}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        selectionMode="single"
      />

      <div className="mt-4 text-sm">
        <strong>Selected:</strong>{' '}
        {selectedKeys === 'all'
          ? 'All items'
          : Array.from(selectedKeys).join(', ')}
      </div>
    </div>
  );
};

export const Default: Story = {
  render: InteractiveSearchListBox,
  args: {
    values: sampleValues,
    selectionMode: 'single',
    'aria-label': 'Search listbox',
  },
};
