import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
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
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Template Components
const BasicTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:flex ui:min-h-screen ui:items-center ui:justify-center ui:p-4">
      <Button intent="primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Header>Modal Title</Modal.Header>
        <Modal.Body>
          <p>This is the modal body content. You can put any content here.</p>
          <p className="ui:mt-4">
            The modal uses compound components: Modal.Header, Modal.Body, and
            Modal.Footer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button intent="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button intent="primary" onClick={() => setIsOpen(false)}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const WithoutFooterTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:flex ui:min-h-screen ui:items-center ui:justify-center ui:p-4">
      <Button intent="primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Header>Information</Modal.Header>
        <Modal.Body>
          <p>This modal doesn't have a footer.</p>
          <p className="ui:mt-4">
            Press Escape or click the backdrop to close.
          </p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const WithoutHeaderTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:flex ui:min-h-screen ui:items-center ui:justify-center ui:p-4">
      <Button intent="primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Body>
          <p className="ui:mb-4 ui:text-lg ui:font-bold">No Header Modal</p>
          <p>This modal doesn't have a separate header component.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button intent="primary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const CustomStylingTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:flex ui:min-h-screen ui:items-center ui:justify-center ui:p-4">
      <Button intent="primary" onClick={() => setIsOpen(true)}>
        Open Custom Modal
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Header className="ui:bg-blue-50">
          Custom Styled Header
        </Modal.Header>
        <Modal.Body className="ui:min-h-[200px] ui:bg-gray-50">
          <p>
            This modal has custom styling applied to its compound components.
          </p>
          <p className="ui:mt-4">
            You can pass className props to Modal.Header, Modal.Body, and
            Modal.Footer.
          </p>
        </Modal.Body>
        <Modal.Footer className="ui:justify-start ui:bg-blue-50">
          <Button intent="primary" onClick={() => setIsOpen(false)}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const NonDismissableTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:flex ui:min-h-screen ui:items-center ui:justify-center ui:p-4">
      <Button intent="primary" onClick={() => setIsOpen(true)}>
        Open Non-Dismissable Modal
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Header>Important Action Required</Modal.Header>
        <Modal.Body>
          <p>
            This modal cannot be dismissed by clicking the backdrop or pressing
            Escape.
          </p>
          <p className="ui:mt-4">You must click one of the buttons below.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button intent="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button intent="primary" onClick={() => setIsOpen(false)}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const AlertDialogTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:flex ui:min-h-screen ui:items-center ui:justify-center ui:p-4">
      <Button intent="destructivePrimary" onClick={() => setIsOpen(true)}>
        Delete Item
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Header>Confirm Deletion</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this item?</p>
          <p className="ui:mt-4 ui:text-red-600">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button intent="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button intent="destructivePrimary" onClick={() => setIsOpen(false)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const LongContentTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ui:flex ui:min-h-screen ui:items-center ui:justify-center ui:p-4">
      <Button intent="primary" onClick={() => setIsOpen(true)}>
        Open Modal with Long Content
      </Button>
      <Modal {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Header>Terms and Conditions</Modal.Header>
        <Modal.Body>
          <p>
            This is a long content example that demonstrates scrolling within
            the modal.
          </p>
          {Array.from({ length: 50 }, (_, i) => (
            <p key={i} className="ui:mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Paragraph{' '}
              {i + 1}.
            </p>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button intent="secondary" onClick={() => setIsOpen(false)}>
            Decline
          </Button>
          <Button intent="primary" onClick={() => setIsOpen(false)}>
            Accept
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Stories
export const Basic: Story = {
  render: BasicTemplate,
  args: {
    size: 'md',
    isDismissable: true,
    isKeyboardDismissDisabled: false,
  },
};

export const WithoutFooter: Story = {
  render: WithoutFooterTemplate,
  args: {
    size: 'md',
    isDismissable: true,
  },
};

export const WithoutHeader: Story = {
  render: WithoutHeaderTemplate,
  args: {
    size: 'md',
  },
};

export const CustomStyling: Story = {
  render: CustomStylingTemplate,
  args: {
    size: 'lg',
  },
};

export const WithoutCloseButton: Story = {
  render: BasicTemplate,
  args: {
    size: 'md',
    showCloseButton: false,
  },
};

export const SmallSize: Story = {
  render: BasicTemplate,
  args: {
    size: 'sm',
  },
};

export const LargeSize: Story = {
  render: BasicTemplate,
  args: {
    size: 'lg',
  },
};

export const ExtraLargeSize: Story = {
  render: BasicTemplate,
  args: {
    size: 'xl',
  },
};

export const FullSize: Story = {
  render: BasicTemplate,
  args: {
    size: 'full',
  },
};

export const NonDismissable: Story = {
  render: NonDismissableTemplate,
  args: {
    size: 'md',
    isDismissable: false,
    isKeyboardDismissDisabled: true,
  },
};

export const AlertDialog: Story = {
  render: AlertDialogTemplate,
  args: {
    size: 'sm',
    role: 'alertdialog',
    isDismissable: false,
  },
};

export const LongContent: Story = {
  render: LongContentTemplate,
  args: {
    size: 'md',
  },
};
