import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    role: {
      control: { type: 'select' },
      options: ['dialog', 'alertdialog'],
    },
    showCloseButton: {
      control: { type: 'boolean' },
    },
    isDismissable: {
      control: { type: 'boolean' },
    },
    isKeyboardDismissDisabled: {
      control: { type: 'boolean' },
    },
    shouldBlockScroll: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Controlled Modal Template
const ControlledModalTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:min-h-screen ui:flex ui:items-center ui:justify-center ui:p-4">
      <Button intent="primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        {args.children ? (
          args.children
        ) : (
          <Text size="md">
            This is a controlled modal. The modal state is managed externally by
            the parent component.
          </Text>
        )}
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: ControlledModalTemplate,
  args: {
    title: 'Modal Title',
    size: 'md',
    showCloseButton: true,
    isDismissable: true,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const WithFooter: Story = {
  render: ControlledModalTemplate,
  args: {
    title: 'Confirm Action',
    size: 'md',
    footer: (
      <div className="ui:flex ui:gap-3">
        <Button intent="secondary" size="medium">
          Cancel
        </Button>
        <Button intent="primary" size="medium">
          Confirm
        </Button>
      </div>
    ),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const WithTrigger: Story = {
  args: {
    title: 'Triggered Modal',
    size: 'md',
    trigger: <Button intent="primary">Click me to open modal</Button>,
    children: (
      <Text>
        This modal uses the trigger prop and DialogTrigger from React Aria. The
        modal state is managed internally.
      </Text>
    ),
  },
};

export const AlertDialog: Story = {
  render: ControlledModalTemplate,
  args: {
    title: 'Delete Item',
    role: 'alertdialog',
    size: 'sm',
    showCloseButton: false,
    isDismissable: false,
    isKeyboardDismissDisabled: true,
    children: (
      <Text>
        Are you sure you want to delete this item? This action cannot be undone.
      </Text>
    ),
    footer: (
      <div className="ui:flex ui:gap-3">
        <Button intent="secondary" size="medium">
          Cancel
        </Button>
        <Button intent="destructivePrimary" size="medium">
          Delete
        </Button>
      </div>
    ),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const LargeContent: Story = {
  render: ControlledModalTemplate,
  args: {
    title: 'Large Content Modal',
    size: 'lg',
    children: (
      <div className="ui:space-y-4">
        <Text>
          This modal contains a lot of content to demonstrate scrolling
          behavior.
        </Text>
        {Array.from({ length: 20 }, (_, i) => (
          <Text key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </Text>
        ))}
      </div>
    ),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const NoHeader: Story = {
  render: ControlledModalTemplate,
  args: {
    size: 'md',
    showCloseButton: false,
    children: (
      <div className="ui:text-center ui:space-y-4">
        <Text className="ui:text-lg ui:font-semibold">
          Modal without header
        </Text>
        <Text>
          This modal doesn't have a title or close button in the header.
        </Text>
      </div>
    ),
    footer: (
      <Button intent="primary" size="medium">
        Got it
      </Button>
    ),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

const SizesTemplate = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const sizes = ['sm', 'md', 'lg', 'xl'] as const;

  return (
    <div className="ui:flex ui:gap-4 ui:flex-wrap">
      {sizes.map(size => (
        <div key={size}>
          <Button
            intent="primary"
            size="small"
            onClick={() => setOpenModal(size)}
          >
            {size.toUpperCase()} Modal
          </Button>
          <Modal
            isOpen={openModal === size}
            onOpenChange={isOpen => !isOpen && setOpenModal(null)}
            title={`${size.toUpperCase()} Modal`}
            size={size}
          >
            <Text>
              This is a {size} sized modal. Resize your browser window to see
              how it responds.
            </Text>
          </Modal>
        </div>
      ))}
    </div>
  );
};

export const Sizes: Story = {
  render: () => <SizesTemplate />,
  parameters: {
    layout: 'padded',
  },
};
