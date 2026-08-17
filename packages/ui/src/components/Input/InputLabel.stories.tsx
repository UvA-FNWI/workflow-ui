import type { Meta, StoryObj } from '@storybook/react';

import { InputLabel } from './InputLabel';

const meta: Meta<typeof InputLabel> = {
  title: 'Components/InputLabel',
  component: InputLabel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The shared visual label used by form components. Prefer a complete input component when possible; use `InputLabel` directly when building a custom field and connect it to the control with `htmlFor`.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Label content.',
    },
    htmlFor: {
      control: 'text',
      description: 'ID of the associated form control.',
    },
    className: {
      control: 'text',
      description: 'Additional classes applied to the label.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputLabel>;

export const Default: Story = {
  args: {
    children: 'Email address',
  },
};

export const AssociatedField: Story = {
  args: { children: 'Project name' },
  render: () => (
    <div className="ui:w-72">
      <InputLabel htmlFor="documented-project-name">Project name</InputLabel>
      <input
        id="documented-project-name"
        className="ui:min-h-10 ui:w-full ui:rounded-xs ui:border ui:border-grey-600 ui:bg-grey-100 ui:px-3 ui:py-2 ui:outline-none ui:focus:ring-2 ui:focus:ring-navy-600 ui:dark:border-grey-400 ui:dark:bg-grey-900 ui:dark:text-white"
        placeholder="Enter a project name"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`htmlFor` must match the custom control ID so clicking the label moves focus to that control.',
      },
    },
  },
};

export const RequiredLabel: Story = {
  args: {
    children: (
      <>
        Course name <span aria-hidden="true">*</span>
      </>
    ),
  },
};
