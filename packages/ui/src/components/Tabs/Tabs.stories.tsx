import { useState } from 'react';

import type { Key } from 'react-stately';

import type { Meta, StoryObj } from '@storybook/react';

import { Tab, Tabs, TabsProps } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs aria-label="Main tabs">
      <Tab title="Overview">
        <div>
          <h3 className="ui:text-lg ui:font-semibold ui:mb-2 ui:text-black ui:dark:text-white">
            Overview
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            This is the overview tab content. It provides a general summary of
            the information.
          </p>
        </div>
      </Tab>
      <Tab title="Details">
        <div>
          <h3 className="ui:text-lg ui:font-semibold ui:mb-2 ui:text-black ui:dark:text-white">
            Details
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Here you can find more detailed information about the selected
            topic.
          </p>
        </div>
      </Tab>
      <Tab title="Settings">
        <div>
          <h3 className="ui:text-lg ui:font-semibold ui:mb-2 ui:text-black ui:dark:text-white">
            Settings
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Configure your preferences and options in this settings panel.
          </p>
        </div>
      </Tab>
    </Tabs>
  ),
};

const ControlledTabsExample = (args: Partial<TabsProps>) => {
  const [selectedKey, setSelectedKey] = useState<Key>('overview');

  return (
    <div>
      <p className="ui:mb-4 ui:text-sm ui:text-grey-600 ui:dark:text-grey-400">
        Selected tab: <strong>{String(selectedKey)}</strong>
      </p>
      <Tabs
        {...args}
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
        aria-label="Controlled tabs"
      >
        <Tab id="overview" title="Overview">
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Overview content
          </p>
        </Tab>
        <Tab id="details" title="Details">
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Details content
          </p>
        </Tab>
        <Tab id="settings" title="Settings">
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Settings content
          </p>
        </Tab>
      </Tabs>
    </div>
  );
};

export const Controlled: Story = {
  render: args => <ControlledTabsExample {...args} />,
};

export const WithDefaultSelected: Story = {
  render: () => (
    <Tabs defaultSelectedKey="details" aria-label="Tabs with default selection">
      <Tab id="overview" title="Overview">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Overview content
        </p>
      </Tab>
      <Tab id="details" title="Details">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          This tab is selected by default!
        </p>
      </Tab>
      <Tab id="settings" title="Settings">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Settings content
        </p>
      </Tab>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs orientation="vertical" aria-label="Vertical tabs">
      <Tab title="Overview">
        <div>
          <h3 className="ui:text-lg ui:font-semibold ui:mb-2 ui:text-black ui:dark:text-white">
            Overview
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            This is the overview tab content.
          </p>
        </div>
      </Tab>
      <Tab title="Details">
        <div>
          <h3 className="ui:text-lg ui:font-semibold ui:mb-2 ui:text-black ui:dark:text-white">
            Details
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Here you can find more detailed information.
          </p>
        </div>
      </Tab>
      <Tab title="Settings">
        <div>
          <h3 className="ui:text-lg ui:font-semibold ui:mb-2 ui:text-black ui:dark:text-white">
            Settings
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Configure your preferences here.
          </p>
        </div>
      </Tab>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs aria-label="Tabs with disabled item">
      <Tab title="Active Tab">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          This tab is active and clickable.
        </p>
      </Tab>
      <Tab title="Disabled Tab" isDisabled>
        <p>You cannot see this content.</p>
      </Tab>
      <Tab title="Another Tab">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          This is another active tab.
        </p>
      </Tab>
    </Tabs>
  ),
};

export const AllDisabled: Story = {
  render: () => (
    <Tabs isDisabled aria-label="All disabled tabs">
      <Tab title="Tab 1">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">Content 1</p>
      </Tab>
      <Tab title="Tab 2">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">Content 2</p>
      </Tab>
      <Tab title="Tab 3">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">Content 3</p>
      </Tab>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs aria-label="Many tabs example">
      <Tab title="First">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Content for first tab
        </p>
      </Tab>
      <Tab title="Second">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Content for second tab
        </p>
      </Tab>
      <Tab title="Third">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Content for third tab
        </p>
      </Tab>
      <Tab title="Fourth">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Content for fourth tab
        </p>
      </Tab>
      <Tab title="Fifth">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Content for fifth tab
        </p>
      </Tab>
      <Tab title="Sixth">
        <p className="ui:text-grey-700 ui:dark:text-grey-300">
          Content for sixth tab
        </p>
      </Tab>
    </Tabs>
  ),
};

export const WithRichContent: Story = {
  render: () => (
    <Tabs aria-label="Settings with icons">
      <Tab
        id="profile"
        title={
          <span className="ui:flex ui:items-center ui:gap-2">
            <svg
              className="ui:w-4 ui:h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            Profile
          </span>
        }
      >
        <div className="ui:space-y-4">
          <h3 className="ui:text-lg ui:font-semibold ui:text-black ui:dark:text-white">
            User Profile
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Manage your account settings and preferences.
          </p>
        </div>
      </Tab>
      <Tab
        id="notifications"
        title={
          <span className="ui:flex ui:items-center ui:gap-2">
            <svg
              className="ui:w-4 ui:h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Notifications
          </span>
        }
      >
        <div className="ui:space-y-4">
          <h3 className="ui:text-lg ui:font-semibold ui:text-black ui:dark:text-white">
            Notification Settings
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Configure how you want to receive updates.
          </p>
        </div>
      </Tab>
      <Tab
        id="security"
        title={
          <span className="ui:flex ui:items-center ui:gap-2">
            <svg
              className="ui:w-4 ui:h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Security
          </span>
        }
      >
        <div className="ui:space-y-4">
          <h3 className="ui:text-lg ui:font-semibold ui:text-black ui:dark:text-white">
            Security Settings
          </h3>
          <p className="ui:text-grey-700 ui:dark:text-grey-300">
            Manage your password and security preferences.
          </p>
        </div>
      </Tab>
    </Tabs>
  ),
};
