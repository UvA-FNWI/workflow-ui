import type { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../..';
import { Callout } from './Callout';

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['note', 'error', 'warning', 'info', 'success'],
      description: 'The type of callout to display',
    },
    header: {
      control: 'text',
      description: 'The header text of the callout',
    },
    action: {
      control: 'text',
      description: 'The action text or element of the callout',
    },
    icon: {
      control: false,
      description: 'Custom icon for the callout',
    },
    isCloseable: {
      control: 'boolean',
      description: 'Whether the callout can be closed',
    },
    children: {
      control: 'text',
      description: 'The main content of the callout',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  args: {
    children: 'This is the default Callout',
    header: 'Information title',
  },
};

export const Overview: Story = {
  args: {
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    header: 'Information title',
  },
  render: props => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '60vh',
        }}
      >
        <Callout {...props} type="note" action="See results" isCloseable />
        <Callout {...props} type="info" action="See results" isCloseable />
        <Callout {...props} type="error" action="See results" isCloseable />
        <Callout {...props} type="warning" action="See results" isCloseable />
        <Callout {...props} type="success" action="See results" isCloseable />
      </div>
    );
  },
};

export const OverviewTitleless: Story = {
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore',
  },
  render: props => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '60vh',
        }}
      >
        <Callout {...props} type="info" />
        <Callout {...props} type="error" />
        <Callout {...props} type="warning" />
      </div>
    );
  },
};

export const Actions: Story = {
  args: {
    children: 'Lorem ipsum dolor sit amet',
    action: 'See results',
  },
  render: props => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '60vh',
        }}
      >
        <Callout {...props} type="info" />
        <Callout {...props} type="error" />
        <Callout {...props} type="warning" />
      </div>
    );
  },
};

export const CustomIcon: Story = {
  args: {
    type: 'info',
    children: 'Anne Smith',
    header: 'Information title',
    icon: <Icon name="user-line" color="current" />,
    isCloseable: false,
  },
};
