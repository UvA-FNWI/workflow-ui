import type { Meta, StoryObj } from '@storybook/react';

import { InputDescription } from './InputDescription';

const meta: Meta<typeof InputDescription> = {
  title: 'Components/InputDescription',
  component: InputDescription,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Supporting text for a form control. Complete input components render it automatically; when composing a custom field, reference its ID with the control’s `aria-describedby` attribute.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Helpful, non-error guidance for the field.',
    },
    className: {
      control: 'text',
      description: 'Additional classes applied to the description.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputDescription>;

export const Default: Story = {
  args: {
    children: 'Use the email address associated with your university account.',
  },
};

export const WithCustomField: Story = {
  args: { children: 'Maximum 120 characters.' },
  render: () => (
    <div className="ui:w-72">
      <input
        aria-label="Summary"
        aria-describedby="documented-summary-description"
        className="ui:min-h-10 ui:w-full ui:rounded-xs ui:border ui:border-grey-600 ui:bg-grey-100 ui:px-3 ui:py-2 ui:outline-none ui:dark:border-grey-400 ui:dark:bg-grey-900 ui:dark:text-white"
        placeholder="Short summary"
      />
      <InputDescription id="documented-summary-description">
        Maximum 120 characters.
      </InputDescription>
    </div>
  ),
};
