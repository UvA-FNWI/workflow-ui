import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Icon } from '../Icon';
import { Text } from '../Text/Text';
import { Disclosure } from './Disclosure';

type DisclosureArgs = Omit<
  ComponentPropsWithoutRef<typeof Disclosure>,
  'children'
>;

const meta = {
  title: 'Components/Disclosure',
  component: Disclosure,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
    shadow: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
    border: {
      control: { type: 'select' },
      options: ['none', 'thin', 'medium'],
    },
  },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

// Template Components
const BasicTemplate = (args: DisclosureArgs) => {
  return (
    <Disclosure {...args}>
      <Disclosure.Header>
        <h3 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
          Section Title
        </h3>
      </Disclosure.Header>
      <Disclosure.Content>
        <Text>
          This is the content that appears when you expand the disclosure.
        </Text>
      </Disclosure.Content>
    </Disclosure>
  );
};

const DefaultOpenTemplate = (args: DisclosureArgs) => {
  return (
    <Disclosure {...args} defaultExpanded>
      <Disclosure.Header>
        <h3 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
          Pre-expanded Section
        </h3>
      </Disclosure.Header>
      <Disclosure.Content>
        <Text>This disclosure starts in an expanded state by default.</Text>
      </Disclosure.Content>
    </Disclosure>
  );
};

const ControlledTemplate = (args: DisclosureArgs) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="ui:space-y-4">
      <Button intent="primary" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Close' : 'Open'} Disclosure
      </Button>
      <Disclosure
        {...args}
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
      >
        <Disclosure.Header>
          <h3 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
            Controlled Disclosure
          </h3>
        </Disclosure.Header>
        <Disclosure.Content>
          <Text>
            The state of this disclosure is controlled from outside the
            component.
          </Text>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
};

const CustomHeaderTemplate = (args: DisclosureArgs) => {
  return (
    <Disclosure {...args}>
      <Disclosure.Header>
        <div className="ui:flex ui:items-center ui:gap-3">
          <Icon name="lightbulb-solid" size="md" color="warning" />
          <div>
            <h3 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
              Custom Header
            </h3>
            <p className="ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
              With icon and subtitle
            </p>
          </div>
        </div>
      </Disclosure.Header>
      <Disclosure.Content>
        <Text>
          You can customize the header with icons, badges, or any other content.
        </Text>
      </Disclosure.Content>
    </Disclosure>
  );
};

const WithoutChevronTemplate = (args: DisclosureArgs) => {
  return (
    <Disclosure {...args}>
      <Disclosure.Header showChevron={false}>
        <h3 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
          No Chevron
        </h3>
      </Disclosure.Header>
      <Disclosure.Content>
        <Text>
          The chevron icon can be hidden by setting showChevron to false.
        </Text>
      </Disclosure.Content>
    </Disclosure>
  );
};

const RichContentTemplate = (args: DisclosureArgs) => {
  return (
    <Disclosure {...args} defaultExpanded>
      <Disclosure.Header>
        <div className="ui:flex ui:items-center ui:gap-3">
          <Icon name="rocket-solid" size="md" color="primary" />
          <h3 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
            Complex Content
          </h3>
        </div>
      </Disclosure.Header>
      <Disclosure.Content>
        <div className="ui:space-y-4">
          <Text>The content area supports any React content:</Text>
          <ul className="ui:list-disc ui:space-y-2 ui:pl-6 ui:text-grey-700 ui:dark:text-grey-300">
            <li>Lists and formatted text</li>
            <li>Images and media</li>
            <li>Forms and interactive elements</li>
            <li>Other components</li>
          </ul>
          <div className="ui:mt-4 ui:flex ui:gap-2">
            <Button intent="primary" size="small">
              Action Button
            </Button>
            <Button intent="secondary" size="small">
              Cancel
            </Button>
          </div>
        </div>
      </Disclosure.Content>
    </Disclosure>
  );
};

const NestedTemplate = (args: DisclosureArgs) => {
  return (
    <Disclosure {...args}>
      <Disclosure.Header>
        <h3 className="ui:text-lg ui:font-semibold ui:text-grey-900 ui:dark:text-white">
          Parent Section
        </h3>
      </Disclosure.Header>
      <Disclosure.Content>
        <div className="ui:space-y-4">
          <Text>You can nest disclosures inside each other.</Text>
          <Disclosure shadow="none" border="thin">
            <Disclosure.Header>
              <h4 className="ui:font-semibold ui:text-grey-900 ui:dark:text-white">
                Nested Section 1
              </h4>
            </Disclosure.Header>
            <Disclosure.Content padding="sm">
              <Text>Nested content goes here.</Text>
            </Disclosure.Content>
          </Disclosure>
          <Disclosure shadow="none" border="thin">
            <Disclosure.Header>
              <h4 className="ui:font-semibold ui:text-grey-900 ui:dark:text-white">
                Nested Section 2
              </h4>
            </Disclosure.Header>
            <Disclosure.Content padding="sm">
              <Text>More nested content.</Text>
            </Disclosure.Content>
          </Disclosure>
        </div>
      </Disclosure.Content>
    </Disclosure>
  );
};

// Stories
export const Basic: Story = {
  render: BasicTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const DefaultOpen: Story = {
  render: DefaultOpenTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const Controlled: Story = {
  render: ControlledTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const CustomHeader: Story = {
  render: CustomHeaderTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const WithoutChevron: Story = {
  render: WithoutChevronTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const RichContent: Story = {
  render: RichContentTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const Nested: Story = {
  render: NestedTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const SmallPadding: Story = {
  render: BasicTemplate,
  args: {
    padding: 'sm',
    shadow: 'none',
    border: 'none',
    children: null,
  },
};

export const MediumShadow: Story = {
  render: BasicTemplate,
  args: {
    padding: 'none',
    shadow: 'md',
    border: 'none',
    children: null,
  },
};

export const WithBorder: Story = {
  render: BasicTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'medium',
    children: null,
  },
};

export const Disabled: Story = {
  render: BasicTemplate,
  args: {
    padding: 'none',
    shadow: 'none',
    border: 'none',
    children: null,
    isDisabled: true,
  },
};
