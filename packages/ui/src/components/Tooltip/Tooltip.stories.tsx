import type { Meta, StoryObj } from '@storybook/react';

import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'The content displayed inside the tooltip popup.',
    },
    delay: {
      control: { type: 'number' },
      description: 'The delay in milliseconds before the tooltip appears.',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class name for the tooltip popup.',
    },
    children: {
      control: false,
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <button style={{ padding: '8px 16px' }}>Hover me</button>,
  },
};

export const WithLongContent: Story = {
  args: {
    content:
      'This tooltip has a longer description to show how it handles more text content.',
    children: <button style={{ padding: '8px 16px' }}>Long content</button>,
  },
};

export const WithJSXContent: Story = {
  args: {
    content: (
      <span>
        <strong>Bold</strong> and <em>italic</em> content
      </span>
    ),
    children: <button style={{ padding: '8px 16px' }}>Rich content</button>,
  },
};

export const CustomDelay: Story = {
  args: {
    content: 'Appears after 1 second',
    delay: 1000,
    children: <button style={{ padding: '8px 16px' }}>Slow tooltip</button>,
  },
};

export const NoDelay: Story = {
  args: {
    content: 'Instant tooltip',
    delay: 0,
    children: <button style={{ padding: '8px 16px' }}>Instant</button>,
  },
};

export const Disabled: Story = {
  args: {
    content: 'You will not see this',
    isDisabled: true,
    children: <button style={{ padding: '8px 16px' }}>Disabled tooltip</button>,
  },
};

export const OnIcon: Story = {
  args: {
    content: 'More information',
    children: (
      <span
        role="img"
        aria-label="info"
        style={{ cursor: 'pointer', fontSize: '20px' }}
      >
        ℹ️
      </span>
    ),
  },
};

/**
 * Plain text triggers are made focusable automatically, so keyboard users can
 * read the tooltip too. Hover the text, then move the pointer onto the tooltip:
 * it stays open (WCAG 1.4.13 hoverable). Press Escape to dismiss it.
 */
export const OnText: Story = {
  args: {
    content: 'Calculated grade will be a fail if the minimum is not met',
    children: (
      <span style={{ textDecoration: 'underline dotted' }}>Must be ≥ 5.5</span>
    ),
  },
};

/** A disabled button cannot receive focus, so the wrapper becomes focusable. */
export const OnDisabledButton: Story = {
  args: {
    content: 'There are no changes to save',
    children: <button disabled>Save</button>,
  },
};

/**
 * Near the edge of the viewport the tooltip is shifted to stay on screen; the arrow keeps
 * pointing at the trigger (as with the impersonate icon at the right of the navbar).
 */
export const NearViewportEdge: Story = {
  parameters: { layout: 'fullscreen' },
  render: args => (
    <div
      style={{ display: 'flex', justifyContent: 'flex-end', padding: '80px 0' }}
    >
      <Tooltip {...args}>
        <button aria-label="Impersonate a user">👥</button>
      </Tooltip>
    </div>
  ),
  args: { content: 'Impersonate a user', delay: 0 },
};
