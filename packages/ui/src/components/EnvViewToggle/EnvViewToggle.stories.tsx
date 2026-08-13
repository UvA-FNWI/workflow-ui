import type { Meta, StoryObj } from '@storybook/react';

import { EnvViewToggle, useProductionView } from './EnvViewToggle';

const meta: Meta<typeof EnvViewToggle> = {
  title: 'Components/EnvViewToggle',
  component: EnvViewToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A development utility that switches environment-specific styling on and off. The preference is persisted in local storage and can be consumed elsewhere with `useProductionView`. In applications the button is fixed to the lower-left viewport corner.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional classes applied to the toggle button.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnvViewToggle>;

function InteractiveExample() {
  const { isProductionView } = useProductionView();

  return (
    <div className="ui:flex ui:min-w-72 ui:flex-col ui:items-center ui:gap-4 ui:rounded-xs ui:border ui:border-grey-300 ui:p-6 ui:dark:border-grey-700">
      <EnvViewToggle className="ui:static" />
      <output className="ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
        Production view: {isProductionView ? 'on' : 'off'}
      </output>
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveExample />,
  parameters: {
    docs: {
      description: {
        story:
          'The demo overrides the fixed positioning so the toggle stays inside the canvas. Activate it to see the shared production-view state update.',
      },
    },
  },
};

export const ApplicationPosition: Story = {
  args: {},
  render: () => (
    <div className="ui:relative ui:h-48 ui:w-96 ui:overflow-hidden ui:rounded-xs ui:border ui:border-grey-300 ui:dark:border-grey-700">
      <p className="ui:p-4 ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
        The toggle is normally anchored to the viewport’s lower-left corner.
      </p>
      <EnvViewToggle className="ui:absolute" />
    </div>
  ),
};
