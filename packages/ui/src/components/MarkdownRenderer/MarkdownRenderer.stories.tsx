import type { Meta, StoryObj } from '@storybook/react';

import { MarkdownRenderer } from './MarkdownRenderer';

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Components/MarkdownRenderer',
  component: MarkdownRenderer,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Markdown string to render',
    },
  },
};

export default meta;

type Story = StoryObj<typeof MarkdownRenderer>;

export const PlainText: Story = {
  args: {
    children: 'This is plain text content.',
  },
};

export const BoldText: Story = {
  args: {
    children: 'This has **bold text** inside it.',
  },
};

export const UnorderedList: Story = {
  args: {
    children: `- First item\n- Second item\n- Third item`,
  },
};

export const OrderedList: Story = {
  args: {
    children: `1. First item\n2. Second item\n3. Third item`,
  },
};

export const WithLineBreaks: Story = {
  args: {
    children: 'First line<br/>Second line<br/>Third line',
  },
};

export const Mixed: Story = {
  args: {
    children: `**Introduction**\n\nHere are the key points:\n\n- Point one with **emphasis**\n- Point two\n- Point three\n\n1. Step one\n2. Step two\n\nFinal note<br/>with a line break.`,
  },
};
