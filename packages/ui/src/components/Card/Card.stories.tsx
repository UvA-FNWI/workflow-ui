import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text/Text';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    border: {
      control: 'select',
      options: ['none', 'thin', 'medium'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card Title
        </Text>
        <Text intent="secondary">
          This is a default card with medium padding, shadow, and border.
        </Text>
      </>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card with No Padding
        </Text>
        <Text intent="secondary">
          This card has no padding. Content goes to the edges.
        </Text>
      </>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card with Small Padding
        </Text>
        <Text intent="secondary">This card has small padding (p-4).</Text>
      </>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card with Large Padding
        </Text>
        <Text intent="secondary">This card has large padding (p-8).</Text>
      </>
    ),
  },
};

export const NoShadow: Story = {
  args: {
    shadow: 'none',
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card with No Shadow
        </Text>
        <Text intent="secondary">This card has no shadow.</Text>
      </>
    ),
  },
};

export const LargeShadow: Story = {
  args: {
    shadow: 'lg',
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card with Large Shadow
        </Text>
        <Text intent="secondary">This card has a large shadow.</Text>
      </>
    ),
  },
};

export const NoBorder: Story = {
  args: {
    border: 'none',
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card with No Border
        </Text>
        <Text intent="secondary">This card has no border.</Text>
      </>
    ),
  },
};

export const MediumBorder: Story = {
  args: {
    border: 'medium',
    children: (
      <>
        <Text size="lg" className="mb-2">
          Card with Medium Border
        </Text>
        <Text intent="secondary">This card has a medium border (2px).</Text>
      </>
    ),
  },
};

export const ComplexContent: Story = {
  args: {
    padding: 'lg',
    shadow: 'lg',
    children: (
      <div>
        <Text size="2xl" className="mb-4">
          Complex Card Example
        </Text>
        <Text className="mb-2">
          This card contains multiple elements and demonstrates how the Card
          component can be used with various content types.
        </Text>
        <Text intent="secondary" size="sm">
          Additional information can be placed here.
        </Text>
      </div>
    ),
  },
};
