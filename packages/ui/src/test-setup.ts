import React from 'react';

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mock for Icon component to prevent sprite loading issues in all tests
vi.mock('./components/Icon', () => ({
  Icon: ({ name, ...props }: { name: string; [key: string]: unknown }) =>
    React.createElement(
      'div',
      {
        'data-testid': `icon-${name}`,
        'data-icon': name,
        ...props,
      },
      name
    ),
}));

// Also mock the sprite loading functionality
vi.mock('./components/Icon/spriteData', () => ({
  loadSprite: vi.fn().mockResolvedValue(undefined),
  SPRITE_ID: 'datanose-ui-icon-sprite',
}));
