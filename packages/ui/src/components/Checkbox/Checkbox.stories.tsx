import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
};
export default meta;

const InteractiveCheckbox = (args: any) => {
  const [isSelected, setIsSelected] = useState(args.isSelected || false);

  return (
    <Checkbox
      {...args}
      isSelected={isSelected}
      onChange={value => setIsSelected(value)}
    />
  );
};

export const Default: StoryObj<typeof Checkbox> = {
  render: InteractiveCheckbox,
  args: {
    label: 'Checkbox - unchecked',
    isSelected: false,
    isDisabled: false,
    isValid: true,
  },
};

export const Checked: StoryObj<typeof Checkbox> = {
  render: InteractiveCheckbox,
  args: {
    label: 'Checkbox - checked',
    isSelected: true,
    isDisabled: false,
    isValid: true,
  },
};

export const Disabled: StoryObj<typeof Checkbox> = {
  render: InteractiveCheckbox,
  args: {
    label: 'Checkbox - disabled',
    isSelected: false,
    isDisabled: true,
    isValid: true,
  },
};

export const DisabledChecked: StoryObj<typeof Checkbox> = {
  render: InteractiveCheckbox,
  args: {
    label: 'Checkbox - checked & disabled',
    isSelected: true,
    isDisabled: true,
    isValid: true,
  },
};

export const Invalid: StoryObj<typeof Checkbox> = {
  render: InteractiveCheckbox,
  args: {
    label: 'Checkbox - invalid',
    isSelected: false,
    isDisabled: false,
    isValid: false,
  },
};
