import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Tab, TabList, TabPanel, TabPanels, Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Tabs component provides a tabbed interface for organizing content. It follows the controlled/uncontrolled component pattern and is framework-agnostic.

## Features
- **Controlled and Uncontrolled modes**: Use \`activeIndex\` and \`onTabChange\` for controlled mode, or \`defaultActiveIndex\` for uncontrolled
- **Router Integration**: Optional hooks available for URL synchronization
- **Accessibility**: Full keyboard support and ARIA attributes
- **Disabled/Hidden Tabs**: Support for disabled and hidden tabs
- **Imperative API**: Ref-based methods for programmatic control
        `,
      },
    },
  },
  argTypes: {
    activeIndex: {
      control: 'number',
      description: 'Current active tab index (controlled mode)',
      table: { defaultValue: { summary: 'undefined' } },
    },
    defaultActiveIndex: {
      control: 'number',
      description: 'Default active tab index (uncontrolled mode)',
      table: { defaultValue: { summary: '0' } },
    },
    onTabChange: {
      action: 'tab-changed',
      description: 'Callback fired when tab changes',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Template for basic tabs
const BasicTabsTemplate = (args: any) => (
  <Tabs {...args}>
    <TabList>
      <Tab>Overview</Tab>
      <Tab>Settings</Tab>
      <Tab>Analytics</Tab>
      <Tab>Team</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Overview</h3>
          <p>
            This is the overview tab content. It contains general information
            about your account and recent activity.
          </p>
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Settings</h3>
          <p>
            Configure your preferences and account settings here. You can update
            your profile, notifications, and more.
          </p>
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Analytics</h3>
          <p>
            View detailed analytics and metrics about your usage, performance,
            and engagement statistics.
          </p>
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Team</h3>
          <p>
            Manage your team members, roles, and permissions. Invite new users
            and organize your workspace.
          </p>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
);

// Controlled tabs template
const ControlledTabsTemplate = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <strong>Current active tab: {activeIndex}</strong>
        <br />
        <button
          onClick={() => setActiveIndex(0)}
          style={{ marginRight: '8px', marginTop: '8px' }}
        >
          Go to Tab 1
        </button>
        <button
          onClick={() => setActiveIndex(1)}
          style={{ marginRight: '8px', marginTop: '8px' }}
        >
          Go to Tab 2
        </button>
        <button onClick={() => setActiveIndex(2)} style={{ marginTop: '8px' }}>
          Go to Tab 3
        </button>
      </div>

      <Tabs activeIndex={activeIndex} onTabChange={setActiveIndex}>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Reports</Tab>
          <Tab>Users</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div
              style={{
                padding: '20px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
              }}
            >
              <h3>Dashboard</h3>
              <p>
                Welcome to your dashboard! This is a controlled tab component
                example.
              </p>
              <p>
                You can programmatically control which tab is active using the
                buttons above.
              </p>
            </div>
          </TabPanel>
          <TabPanel>
            <div
              style={{
                padding: '20px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
              }}
            >
              <h3>Reports</h3>
              <p>
                Generate and view your reports here. This tab is controlled by
                the parent component state.
              </p>
            </div>
          </TabPanel>
          <TabPanel>
            <div
              style={{
                padding: '20px',
                backgroundColor: '#fefce8',
                borderRadius: '8px',
              }}
            >
              <h3>Users</h3>
              <p>
                Manage your users and their permissions. The active state is
                managed externally.
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

// Template with disabled and states
const TabStatesTemplate = () => (
  <Tabs defaultActiveIndex={0}>
    <TabList>
      <Tab>Active Tab</Tab>
      <Tab disabled>Disabled Tab</Tab>
      <Tab>Another Active Tab</Tab>
      <Tab hidden>Hidden Tab</Tab>
      <Tab>Final Tab</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Active Tab Content</h3>
          <p>This is a normal, active tab that users can interact with.</p>
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Disabled Tab Content</h3>
          <p>This content won't be shown because the tab is disabled.</p>
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Another Active Tab</h3>
          <p>This tab is also interactive and users can click on it.</p>
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Hidden Tab Content</h3>
          <p>This content won't be shown because the tab is hidden.</p>
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: '20px' }}>
          <h3>Final Tab</h3>
          <p>This is the last tab in the list.</p>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
);

export const Default = {
  render: BasicTabsTemplate,
  args: {
    defaultActiveIndex: 0,
  },
} satisfies Story;

export const Uncontrolled = {
  render: BasicTabsTemplate,
  args: {
    defaultActiveIndex: 2,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uncontrolled tabs manage their own state. Use `defaultActiveIndex` to set the initial active tab.',
      },
    },
  },
} satisfies Story;

export const Controlled = {
  render: ControlledTabsTemplate,
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Controlled tabs allow you to manage the active state externally. Use `activeIndex` and `onTabChange` props for full control.',
      },
    },
  },
} satisfies Story;

export const WithDisabledAndHiddenTabs = {
  render: TabStatesTemplate,
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Tabs can be disabled (non-interactive) or hidden (not visible). Disabled tabs cannot be clicked, while hidden tabs are not rendered.',
      },
    },
  },
} satisfies Story;

export const MinimalExample = {
  render: () => (
    <Tabs>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Content for tab 1</TabPanel>
        <TabPanel>Content for tab 2</TabPanel>
      </TabPanels>
    </Tabs>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Minimal tabs setup with no configuration. Defaults to uncontrolled mode with first tab active.',
      },
    },
  },
} satisfies Story;
