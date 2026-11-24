import React from 'react';

import type { Preview } from '@storybook/react-vite';

import { ThemeProvider } from '../src/components/ThemeProvider';
import './preview.css';

const preview: Preview = {
  parameters: {
    // Accessibility panel (axe): check against WCAG 2.2 A + AA
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: [
            'wcag2a',
            'wcag2aa',
            'wcag21a',
            'wcag21aa',
            'wcag22a',
            'wcag22aa',
          ],
        },
      },
      test: 'todo',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: 'var(--ui-color-grey-100)',
        },
        {
          name: 'dark',
          value: 'var(--ui-color-grey-900)',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'system',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
          { value: 'system', icon: 'browser', title: 'System' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'system';

      return React.createElement(ThemeProvider, {
        key: `theme-${theme}`,
        defaultTheme: theme,
        storageKey: 'storybook-theme',
        children: React.createElement(Story),
      });
    },
  ],
};

export default preview;
