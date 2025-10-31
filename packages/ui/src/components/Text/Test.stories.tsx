import type { Meta, StoryObj } from '@storybook/react';

import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'The text content to display',
    },
    as: {
      control: { type: 'select' },
      options: ['p', 'span', 'b', 'i'],
      description: 'The HTML element to render as',
    },
    intent: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
      description: 'The visual intent/style of the text',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
      description: 'The size of the text',
    },
    decoration: {
      control: { type: 'select' },
      options: ['none', 'underline', 'line-through'],
      description: 'Text decoration style',
    },
    textTransform: {
      control: { type: 'select' },
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
      description: 'Text transformation',
    },
    truncate: {
      control: 'boolean',
      description: 'Whether to truncate long text with ellipsis',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'This is the default text component',
  },
};

// Intent variants
export const Primary: Story = {
  args: {
    children: 'Primary text style',
    intent: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary text style',
    intent: 'secondary',
  },
};

// Size variants
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text size="xs">Extra Small Text (xs)</Text>
      <Text size="sm">Small Text (sm)</Text>
      <Text size="md">Medium Text (md) - Default</Text>
      <Text size="lg">Large Text (lg)</Text>
      <Text size="xl">Extra Large Text (xl)</Text>
      <Text size="2xl">2X Large Text (2xl)</Text>
      <Text size="3xl">3X Large Text (3xl)</Text>
    </div>
  ),
};

// HTML element variants
export const HtmlElements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text as="p">Paragraph element (default)</Text>
      <Text as="span">Span element</Text>
      <Text as="b">Bold element</Text>
      <Text as="i">Italic element</Text>
    </div>
  ),
};

// Text decorations
export const Decorations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text decoration="none">No decoration (default)</Text>
      <Text decoration="underline">Underlined text</Text>
      <Text decoration="line-through">Strikethrough text</Text>
    </div>
  ),
};

// Text transformations
export const Transformations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text textTransform="none">Normal case (default)</Text>
      <Text textTransform="uppercase">UPPERCASE TEXT</Text>
      <Text textTransform="lowercase">lowercase text</Text>
      <Text textTransform="capitalize">Capitalized Text</Text>
    </div>
  ),
};

// Truncate functionality
export const Truncated: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '300px',
      }}
    >
      <Text truncate={false}>
        This is a very long text that will not be truncated and will wrap to
        multiple lines as needed
      </Text>
      <Text truncate={true}>
        This is a very long text that will be truncated with an ellipsis when it
        exceeds the container width
      </Text>
    </div>
  ),
};
