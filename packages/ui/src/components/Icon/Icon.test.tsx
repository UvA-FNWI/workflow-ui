import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { Icon } from './Icon';
import * as spriteData from './spriteData';

// Mock the spriteData module
vi.mock('./spriteData', () => ({
  loadSprite: vi.fn(),
  SPRITE_ID: 'datanose-ui-icon-sprite',
}));

describe('Icon Component', () => {
  const mockSpriteContent = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
      <symbol id="test-icon" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z"/>
      </symbol>
      <symbol id="another-icon" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6"/>
      </symbol>
    </svg>
  `;

  const defaultProps = {
    name: 'test-icon',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = '';
    // Reset sprite injection state
    (spriteData.loadSprite as any).mockResolvedValue(mockSpriteContent);
  });

  describe('Basic Rendering', () => {
    test('renders without crashing', async () => {
      render(<Icon {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    test('renders as an SVG element', async () => {
      render(<Icon {...defaultProps} />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg.tagName).toBe('svg');
      });
    });

    test('contains use element with correct href after sprite loads', async () => {
      render(<Icon {...defaultProps} />);

      await waitFor(() => {
        const useElement = document.querySelector('use');
        expect(useElement).toBeInTheDocument();
        expect(useElement).toHaveAttribute('href', '#test-icon');
      });
    });

    test('does not render use element before sprite loads', () => {
      (spriteData.loadSprite as any).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockSpriteContent), 100)
          )
      );

      render(<Icon {...defaultProps} />);

      // Should not have use element immediately
      expect(document.querySelector('use')).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    test('applies default size (md)', async () => {
      render(<Icon {...defaultProps} />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveClass('w-5', 'h-5');
      });
    });

    test('applies xs size variant', async () => {
      render(<Icon {...defaultProps} size="xs" />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveClass('w-3', 'h-3');
      });
    });
  });

  describe('Color Variants', () => {
    test('applies default color (primary)', async () => {
      render(<Icon {...defaultProps} />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveClass('text-grey-900');
      });
    });

    test('applies current color variant', async () => {
      render(<Icon {...defaultProps} color="current" />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveClass('text-current');
      });
    });

    test('applies secondary color variant', async () => {
      render(<Icon {...defaultProps} color="secondary" />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveClass('text-grey-600');
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper role and aria attributes by default', async () => {
      render(<Icon {...defaultProps} />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveAttribute('role', 'img');
        expect(svg).toHaveAttribute('aria-label', 'test-icon');
        expect(svg).not.toHaveAttribute('aria-hidden');
      });
    });

    test('uses custom label when provided', async () => {
      render(<Icon {...defaultProps} label="Custom icon label" />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveAttribute('aria-label', 'Custom icon label');
      });
    });

    test('hides from screen readers when decorative', async () => {
      render(<Icon {...defaultProps} decorative />);

      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(svg).not.toHaveAttribute('role');
        expect(svg).not.toHaveAttribute('aria-label');
      });
    });
  });

  describe('Custom Props and Styling', () => {
    test('forwards custom className', async () => {
      render(<Icon {...defaultProps} className="custom-icon" />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveClass('custom-icon');
        expect(svg).toHaveClass('inline-block'); // Should still have base classes
      });
    });

    test('forwards style props', async () => {
      render(<Icon {...defaultProps} style={{ opacity: 0.5 }} />);

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveStyle('opacity: 0.5');
      });
    });

    test('merges custom classes with variant classes', async () => {
      render(
        <Icon
          {...defaultProps}
          size="lg"
          color="danger"
          className="custom-class rotate-90"
        />
      );

      await waitFor(() => {
        const svg = screen.getByRole('img');
        expect(svg).toHaveClass('w-6', 'h-6'); // size classes
        expect(svg).toHaveClass('text-red-600'); // color classes
        expect(svg).toHaveClass('custom-class', 'rotate-90'); // custom classes
        expect(svg).toHaveClass('inline-block'); // base classes
      });
    });
  });

  describe('Sprite Loading and Injection', () => {
    test('calls loadSprite function', () => {
      render(<Icon {...defaultProps} />);
      expect(spriteData.loadSprite).toHaveBeenCalled();
    });

    test('injects sprite into DOM when loaded', async () => {
      render(<Icon {...defaultProps} />);

      await waitFor(() => {
        const spriteContainer = document.querySelector(
          'div[aria-hidden="true"]'
        );
        expect(spriteContainer).toBeInTheDocument();
        expect(spriteContainer?.innerHTML).toContain('datanose-ui-icon-sprite');
      });
    });

    test('handles sprite loading failure gracefully', async () => {
      (spriteData.loadSprite as any).mockRejectedValue(
        new Error('Failed to load')
      );

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<Icon {...defaultProps} />);

      // Icon should still render even if sprite fails to load
      expect(screen.getByRole('img')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('does not inject sprite multiple times', async () => {
      render(<Icon name="icon1" />);
      render(<Icon name="icon2" />);

      await waitFor(() => {
        expect(spriteData.loadSprite).toHaveBeenCalledTimes(1);
      });
    });
  });
});
