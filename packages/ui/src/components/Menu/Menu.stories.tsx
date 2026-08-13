import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Menu>;

const flagIcon = (flag: string) => (
  <span
    aria-hidden="true"
    className="ui:flex ui:h-6 ui:w-6 ui:items-center ui:justify-center ui:text-2xl ui:leading-none"
  >
    {flag}
  </span>
);

export const Basic: Story = {
  args: {
    ariaLabel: 'User menu',
    trigger: ({ triggerProps, triggerRef }) => (
      <Button
        {...triggerProps}
        ref={triggerRef}
        aria-label="Open user menu"
        intent="ghost"
      >
        Open menu
      </Button>
    ),
    children: [
      <MenuItem key="profile" id="profile" label="Profile" />,
      <MenuItem key="settings" id="settings" label="Settings" />,
      <MenuItem
        key="disabled"
        id="disabled"
        label="Unavailable action"
        isDisabled
      />,
      <MenuItem key="logout" id="logout" label="Log out" />,
    ],
  },
};

export const WithIcons: Story = {
  args: {
    ariaLabel: 'Account actions',
    trigger: ({ triggerProps, triggerRef }) => (
      <Button
        {...triggerProps}
        ref={triggerRef}
        aria-label="Open account actions"
        intent="ghost"
      >
        Account actions
      </Button>
    ),
    children: [
      <MenuItem key="profile" id="profile" icon="user-line" label="Profile" />,
      <MenuItem
        key="settings"
        id="settings"
        icon="settings-gear-line"
        label="Settings"
      />,
      <MenuItem key="logout" id="logout" icon="logout-line" label="Log out" />,
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass an icon name to `icon` to render a consistent large, decorative design-system icon.',
      },
    },
  },
};

export const WithCustomIcons: Story = {
  args: {
    ariaLabel: 'Languages',
    selectionMode: 'single',
    selectedKeys: ['en'],
    trigger: ({ triggerProps, triggerRef }) => (
      <Button
        {...triggerProps}
        ref={triggerRef}
        aria-label="Open languages"
        intent="ghost"
      >
        Languages
      </Button>
    ),
    children: [
      <MenuItem
        key="en"
        id="en"
        textValue="English"
        icon={flagIcon('🇬🇧')}
        label="English"
      />,
      <MenuItem
        key="nl"
        id="nl"
        textValue="Dutch"
        icon={flagIcon('🇳🇱')}
        label="Dutch"
      />,
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass any React node to `icon` for custom artwork such as language flags, logos, or avatars.',
      },
    },
  },
};

export const WithSubmenus: Story = {
  args: {
    ariaLabel: 'Preferences',
    trigger: ({ triggerProps, triggerRef }) => (
      <Button
        {...triggerProps}
        ref={triggerRef}
        aria-label="Open preferences"
        intent="ghost"
      >
        Preferences
      </Button>
    ),
    children: [
      <MenuItem key="profile" id="profile" icon="user-line" label="Profile" />,
      <MenuItem
        key="language"
        id="language"
        icon={flagIcon('🇬🇧')}
        label="Language"
        selectionMode="single"
        selectedKeys={['en']}
      >
        <MenuItem
          key="en"
          id="en"
          textValue="English"
          icon={flagIcon('🇬🇧')}
          label="English"
        />
        <MenuItem
          key="nl"
          id="nl"
          textValue="Dutch"
          icon={flagIcon('🇳🇱')}
          label="Dutch"
        />
      </MenuItem>,
      <MenuItem
        key="version"
        id="version"
        icon="text-sparkle-line"
        label="Version"
        selectionMode="single"
        selectedKeys={['stable']}
      >
        <MenuItem key="stable" id="stable" label="Stable" />
        <MenuItem key="preview" id="preview" label="Preview" />
      </MenuItem>,
      <MenuItem key="appearance" id="appearance" label="Appearance">
        <MenuItem
          key="theme"
          id="theme"
          label="Theme"
          selectionMode="single"
          selectedKeys={['system']}
        >
          <MenuItem key="light" id="light" label="Light" />
          <MenuItem key="dark" id="dark" label="Dark" />
          <MenuItem key="system" id="system" label="Use system setting" />
        </MenuItem>
        <MenuItem key="contrast" id="contrast" label="High contrast" />
      </MenuItem>,
    ],
  },
};
