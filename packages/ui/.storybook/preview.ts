import type { Preview } from '@storybook/react-vite'
import './preview.css'
import React from 'react'
import { ThemeProvider } from '../src/components/ThemeProvider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
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

      return React.createElement(
        ThemeProvider,
        {
          key: `theme-${theme}`,
          defaultTheme: theme,
          storageKey: 'storybook-theme',
          children: React.createElement(Story)
        }
      );
    },
  ],
};

export default preview;