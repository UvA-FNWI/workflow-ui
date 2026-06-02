import { useRef } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Popover, usePopoverState } from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Popover>;

const defaultClasses =
  'ui:bg-grey-300 ui:shadow-xl ui:outline-none ui:dark:bg-grey-700';

const BasicPopover = (args: any) => {
  const state = usePopoverState();
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <div className="ui:flex ui:justify-center ui:p-10">
      <Button
        ref={triggerRef as React.RefObject<HTMLButtonElement>}
        onClick={() => state.toggle()}
        intent="primary"
      >
        Toggle Popover
      </Button>
      {state.isOpen && (
        <Popover {...args} state={state} triggerRef={triggerRef}>
          <div className="ui:p-4">Popover content</div>
        </Popover>
      )}
    </div>
  );
};

export const Basic: Story = {
  render: BasicPopover,
  args: { className: defaultClasses },
};

export const WithCustomClass: Story = {
  render: BasicPopover,
  args: {
    className:
      'ui:shadow-lg ui:border ui:border-gray-200 ui:rounded-md ui:bg-white ui:p-2',
  },
};
