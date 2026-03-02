// React
import React from 'react';

// External
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Icon } from '../Icon';
import { useToast } from './hooks/useToast';
// App
import { ToastProvider } from './ToastProvider';
import { ToastRegion } from './ToastRegion';

const meta: Meta<typeof ToastProvider> = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A toast notification system built with React Aria.

## Features
- Accessible toast notifications with screen reader support
- Customizable titles, messages, and actions
- Manual dismissal with close button
- Queue management with maximum visible toasts
- Automatically pause of timer when user interacts with the toast

## Usage
The Toast system requires the ToastProvider to be wrapped around your app, and ToastRegion to display the toasts.
Use the useToast hook to trigger toasts.

## Toast Types
- **Success**: Confirms successful operations (auto-dismiss after 5s)
- **Info**: Provides neutral information (auto-dismiss after 5s)
- **Note**: Displays reminders or notes (auto-dismiss after 5s)
- **Warning**: Alerts about potential issues (stays visible until dismissed)
- **Error**: Reports errors or failures (stays visible until dismissed)

## Accessibility
- Proper ARIA live regions for screen reader announcements
- Keyboard navigation support
- Focus management
- Semantic markup with appropriate roles
                `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ToastProvider>;

// Wrapper component to provide toast context and controls
const ToastDemo = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <div
        style={{
          minHeight: '100vh',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
        }}
      >
        {children}
        <ToastRegion />
      </div>
    </ToastProvider>
  );
};

// Interactive controls component
const ToastControls = () => {
  // Hooks
  const toast = useToast();

  // Functions
  const showSuccessToast = () => {
    toast.success('Your changes have been saved successfully!');
  };

  const showInfoToast = () => {
    toast.info('New features are now available in your dashboard.');
  };

  const showWarningToast = () => {
    toast.warning(
      'Your session will expire in 5 minutes. Please save your work.'
    );
  };

  const showErrorToast = () => {
    toast.error(
      'Failed to connect to the server. Please check your internet connection.'
    );
  };

  const showNoteToast = () => {
    toast.note('Remember to review your settings before the next update.');
  };

  // Render
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5px',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#fff',
        border: '1px solid #e1e5e9',
        minWidth: '400px',
        maxWidth: '500px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
        }}
      >
        <Button
          intent="primary"
          onClick={showSuccessToast}
          size="medium"
          leftIcon={
            <Icon name="circle-checkmark-line" size="sm" color="current" />
          }
        >
          Success
        </Button>

        <Button
          intent="secondary"
          onClick={showInfoToast}
          size="medium"
          leftIcon={<Icon name="square-info-line" size="sm" color="current" />}
        >
          Info
        </Button>

        <Button
          intent="secondary"
          onClick={showNoteToast}
          size="medium"
          leftIcon={
            <Icon name="calendar-edit-line" size="sm" color="current" />
          }
        >
          Note
        </Button>

        <Button
          intent="secondary"
          variant="destructive"
          onClick={showWarningToast}
          size="medium"
          leftIcon={
            <Icon name="triangle-exclamation-line" size="sm" color="current" />
          }
        >
          Warning
        </Button>

        <Button
          intent="primary"
          variant="destructive"
          onClick={showErrorToast}
          size="medium"
          leftIcon={
            <Icon name="triangle-exclamation-line" size="sm" color="current" />
          }
        >
          Error
        </Button>
      </div>
    </div>
  );
};

export const InteractiveDemo: Story = {
  render: () => (
    <ToastDemo>
      <ToastControls />
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing all toast types. Click the buttons to see different toast variations in action.',
      },
    },
  },
};

export const ToastWithActions: Story = {
  render: () => {
    const ActionDemo = () => {
      const toast = useToast();

      const showUndoToast = () => {
        toast.success('Item deleted successfully.', {
          actionLabel: 'Undo',
          onAction: () => {
            toast.info('Deletion has been undone.');
          },
        });
      };

      const showRetryToast = () => {
        toast.error('Failed to upload file.', {
          title: 'Upload Error',
          actionLabel: 'Retry Upload',
          onAction: () => {
            toast.info('Retrying upload...');
          },
        });
      };

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5px',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#fff',
            border: '1px solid #e1e5e9',
            maxWidth: '400px',
          }}
        >
          <h3 style={{ margin: 0 }}>Toast Actions Demo</h3>
          <p style={{ textAlign: 'center', margin: 0 }}>
            Toasts with action buttons provide users with quick recovery
            options.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button intent="primary" onClick={showUndoToast} size="small">
              Delete with Undo
            </Button>

            <Button
              intent="primary"
              variant="destructive"
              onClick={showRetryToast}
              size="small"
            >
              Failed Upload
            </Button>
          </div>
        </div>
      );
    };

    return (
      <ToastDemo>
        <ActionDemo />
      </ToastDemo>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows toasts with action buttons that allow users to take immediate action like undoing operations or retrying failed actions.',
      },
    },
  },
};

export const QueueManagement: Story = {
  render: () => {
    const QueueDemo = () => {
      const toast = useToast();

      const showMultipleToasts = () => {
        // Show multiple toasts rapidly to demonstrate queue management
        for (let i = 1; i <= 10; i++) {
          setTimeout(() => {
            toast.info(`Toast notification #${i}`, {
              lifetime: 3,
            });
          }, i * 100);
        }
      };

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5px',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#fff',
            border: '1px solid #e1e5e9',
            maxWidth: '500px',
          }}
        >
          <h3>Queue Management Demo</h3>
          <p style={{ textAlign: 'center', margin: 0 }}>
            The toast system manages multiple notifications with a maximum of 8
            visible toasts.
          </p>

          <Button
            intent="secondary"
            onClick={showMultipleToasts}
            size="medium"
            leftIcon={
              <Icon name="notification-line" size="sm" color="current" />
            }
          >
            Show 10 Toasts
          </Button>
        </div>
      );
    };

    return (
      <ToastDemo>
        <QueueDemo />
      </ToastDemo>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the toast system manages multiple notifications, maintaining a maximum of 8 visible toasts and queueing additional ones.',
      },
    },
  },
};
