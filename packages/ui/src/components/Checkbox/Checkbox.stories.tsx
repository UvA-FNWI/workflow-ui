import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
};
export default meta;

export const Default: StoryObj<typeof Checkbox> = {
  args: {
    label: 'Accept terms',
    checked: false,
    onChange: () => {},
  },
};
