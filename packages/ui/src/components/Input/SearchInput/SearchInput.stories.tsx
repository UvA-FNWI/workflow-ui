import { type ComponentProps, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

const InteractiveSearchInput = (args: ComponentProps<typeof SearchInput>) => {
  const [value, setValue] = useState<string | undefined>(args.value);

  return <SearchInput {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: InteractiveSearchInput,
  args: {
    label: 'Search input',
    placeholder: 'Enter a search query',
    isDisabled: false,
    isValid: true,
  },
};

export const WithError: Story = {
  render: InteractiveSearchInput,
  args: {
    label: 'Search input with error',
    placeholder: 'Enter a search query',
    description: 'This field is required.',
    errorMessage: 'Please enter a search query.',
    isDisabled: false,
    isValid: false,
  },
};

export const Disabled: Story = {
  render: InteractiveSearchInput,
  args: {
    label: 'Disabled search input',
    placeholder: 'Cannot edit this',
    isDisabled: true,
    isValid: true,
  },
};
