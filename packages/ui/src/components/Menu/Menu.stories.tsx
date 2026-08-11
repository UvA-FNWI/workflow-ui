import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button/Button';
import { Icon } from '../Icon';
import { Menu, MenuItemDefinition, MenuItemRenderProps } from './Menu';

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

const languageContent = (label: string) =>
  function LanguageContent({ isSelected }: MenuItemRenderProps) {
    return (
      <>
        <span className="ui:min-w-0 ui:flex-1 ui:truncate">{label}</span>
        {isSelected && (
          <Icon name="checkmark-solid" size="sm" color="current" decorative />
        )}
      </>
    );
  };

const flagIcon = (flag: string) => (
  <span
    aria-hidden="true"
    className="ui:flex ui:h-6 ui:w-6 ui:items-center ui:justify-center ui:text-2xl ui:leading-none"
  >
    {flag}
  </span>
);

const basicItems: MenuItemDefinition[] = [
  {
    id: 'profile',
    content: 'Profile',
  },
  {
    id: 'settings',
    content: 'Settings',
  },
  {
    id: 'disabled',
    content: 'Unavailable action',
    isDisabled: true,
  },
  {
    id: 'logout',
    content: 'Log out',
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
    items: [
      {
        id: 'profile',
        icon: 'user-line',
        content: 'Profile',
      },
      {
        id: 'settings',
        icon: 'settings-gear-line',
        content: 'Settings',
      },
      {
        id: 'logout',
        icon: 'logout-line',
        content: 'Log out',
      },
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
    items: [
      {
        id: 'en',
        textValue: 'English',
        icon: flagIcon('🇬🇧'),
        content: languageContent('English'),
      },
      {
        id: 'nl',
        textValue: 'Dutch',
        icon: flagIcon('🇳🇱'),
        content: languageContent('Dutch'),
      },
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
    items: [
      {
        id: 'profile',
        icon: 'user-line',
        content: 'Profile',
      },
      {
        id: 'language',
        icon: flagIcon('🇬🇧'),
        content: 'Language',
        submenu: {
          ariaLabel: 'Language',
          selectionMode: 'single',
          selectedKeys: ['en'],
          items: [
            {
              id: 'en',
              textValue: 'English',
              icon: flagIcon('🇬🇧'),
              content: languageContent('English'),
            },
            {
              id: 'nl',
              textValue: 'Dutch',
              icon: flagIcon('🇳🇱'),
              content: languageContent('Dutch'),
            },
          ],
        },
      },
      {
        id: 'version',
        icon: 'text-sparkle-line',
        content: 'Version',
        submenu: {
          ariaLabel: 'Version',
          selectionMode: 'single',
          selectedKeys: ['stable'],
          items: [
            {
              id: 'stable',
              content: 'Stable',
            },
            {
              id: 'preview',
              content: 'Preview',
            },
          ],
        },
      },
    ],
  },
};
