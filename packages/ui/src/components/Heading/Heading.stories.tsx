import type { Meta, StoryObj } from '@storybook/react';

import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Renders accessible page and section headings using the design-system type scale. Each visual size selects a matching semantic heading level by default, while `as` can override the HTML element when the document hierarchy requires it.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Heading content.',
      table: { category: 'Content' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Visual heading size and default semantic level.',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'md' },
      },
    },
    fontType: {
      control: 'select',
      options: ['heading', 'body'],
      description: 'Font family used for the heading.',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'heading' },
      },
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5'],
      description: 'Overrides the generated semantic heading element.',
      table: { category: 'Semantics' },
    },
    className: {
      control: 'text',
      description: 'Additional classes applied to the heading.',
      table: { category: 'Styling' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    children: 'Section heading',
    size: 'md',
  },
};

export const TypeScale: Story = {
  args: { children: 'Heading' },
  render: () => (
    <div className="ui:flex ui:flex-col ui:gap-5">
      <Heading size="xl">Extra large — h1</Heading>
      <Heading size="lg">Large — h2</Heading>
      <Heading size="md">Medium — h3</Heading>
      <Heading size="sm">Small — h4</Heading>
      <Heading size="xs">Extra small — h5</Heading>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The default semantic element follows the visual scale from `h1` at `xl` through `h5` at `xs`.',
      },
    },
  },
};

export const SemanticOverride: Story = {
  args: {
    children: 'Visually large subsection',
    size: 'xl',
    as: 'h2',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Visual hierarchy and document hierarchy can differ. Here an `h2` receives the extra-large style.',
      },
    },
  },
};

export const BodyFont: Story = {
  args: {
    children: 'Heading using the body font',
    size: 'sm',
    fontType: 'body',
  },
};
