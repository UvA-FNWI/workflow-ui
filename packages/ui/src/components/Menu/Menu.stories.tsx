import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Menu, MenuItemDefinition } from './Menu';

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

const basicItems: MenuItemDefinition[] = [
  {
    id: 'profile',
    textValue: 'Profile',
    content: 'Profile',
    cursor: 'pointer',
  },
  {
    id: 'settings',
    textValue: 'Settings',
    content: 'Settings',
    cursor: 'pointer',
  },
  {
    id: 'disabled',
    textValue: 'Unavailable action',
    content: 'Unavailable action',
    isDisabled: true,
  },
  {
    id: 'logout',
    textValue: 'Log out',
    content: 'Log out',
    cursor: 'pointer',
  },
];

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
    items: basicItems,
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
    items: [
      {
        id: 'language',
        textValue: 'Language',
        content: 'Language ›',
        cursor: 'pointer',
        submenu: {
          ariaLabel: 'Language',
          selectionMode: 'single',
          selectedKeys: ['en'],
          items: [
            {
              id: 'en',
              textValue: 'English',
              content: ({ isSelected }) =>
                isSelected ? '✓ English' : 'English',
              cursor: 'pointer',
            },
            {
              id: 'nl',
              textValue: 'Dutch',
              content: ({ isSelected }) => (isSelected ? '✓ Dutch' : 'Dutch'),
              cursor: 'pointer',
            },
          ],
        },
      },
      {
        id: 'version',
        textValue: 'Version',
        content: 'Version ›',
        cursor: 'pointer',
        submenu: {
          ariaLabel: 'Version',
          selectionMode: 'single',
          selectedKeys: ['stable'],
          items: [
            {
              id: 'stable',
              textValue: 'Stable',
              content: 'Stable',
              cursor: 'pointer',
            },
            {
              id: 'preview',
              textValue: 'Preview',
              content: 'Preview',
              cursor: 'pointer',
            },
          ],
        },
      },
    ],
  },
};
