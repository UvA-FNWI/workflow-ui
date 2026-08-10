import type { Meta, StoryObj } from '@storybook/react';

import { InputError } from './InputError';

const meta: Meta<typeof InputError> = {
  title: 'Components/InputError',
  component: InputError,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Validation feedback for a form control. Complete inputs render it automatically when invalid; custom fields should connect the message with `aria-describedby` and set `aria-invalid` on the control.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Actionable validation message.',
    },
    className: {
      control: 'text',
      description: 'Additional classes applied to the error message.',
    },
    role: {
      control: 'text',
      description:
        'Use `alert` when a newly displayed validation message must be announced immediately.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputError>;

export const Default: Story = {
  args: {
    children: 'Enter a valid university email address.',
  },
};

export const WithInvalidField: Story = {
  args: { children: 'This field is required.' },
  render: () => (
    <div className="ui:w-72">
      <input
        aria-label="Course code"
        aria-invalid="true"
        aria-describedby="documented-course-code-error"
        className="ui:min-h-10 ui:w-full ui:rounded-xs ui:border ui:border-red-600 ui:bg-grey-100 ui:px-3 ui:py-2 ui:outline-none ui:dark:border-red-400 ui:dark:bg-grey-900 ui:dark:text-white"
        placeholder="Course code"
      />
      <InputError id="documented-course-code-error">
        This field is required.
      </InputError>
    </div>
  ),
};
