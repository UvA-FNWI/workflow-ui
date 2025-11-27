import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Icon } from '../Icon';
import { Button } from './Button';

describe('Button', () => {
  describe('Basic rendering', () => {
    it('renders with text content', () => {
      render(<Button intent="primary">Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('renders as button element with correct type', () => {
      render(
        <Button intent="primary" type="submit">
          Submit
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Intent variants', () => {
    it('applies primary intent styles', () => {
      render(<Button intent="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'ui:bg-black',
        'ui:text-white',
        'ui:border-black'
      );
    });

    it('applies secondary intent styles', () => {
      render(<Button intent="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'ui:bg-white',
        'ui:text-black',
        'ui:border-black'
      );
    });

    it('applies destructive primary intent styles', () => {
      render(<Button intent="destructivePrimary">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'ui:bg-red-brand',
        'ui:text-white',
        'ui:border-red-brand'
      );
    });
  });

  describe('Size variants', () => {
    it('applies small size styles', () => {
      render(
        <Button intent="primary" size="small">
          Small
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass(
        'ui:px-2',
        'ui:h-6',
        'ui:text-xs'
      );
    });

    it('applies medium size styles (default)', () => {
      render(<Button intent="primary">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'ui:px-3',
        'ui:h-8',
        'ui:text-sm'
      );
    });

    it('applies large size styles', () => {
      render(
        <Button intent="primary" size="large">
          Large
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass(
        'ui:px-4',
        'ui:h-10',
        'ui:text-base'
      );
    });
  });

  describe('Shape variants', () => {
    it('applies rounded shape (default)', () => {
      render(<Button intent="primary">Rounded</Button>);
      expect(screen.getByRole('button')).toHaveClass('ui:rounded-md');
    });

    it('applies circular shape', () => {
      render(
        <Button intent="primary" shape="circular">
          Circular
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('ui:rounded-full');
    });

    it('applies square shape', () => {
      render(
        <Button intent="primary" shape="square">
          Square
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('ui:rounded-none');
    });
  });

  describe('Width variants', () => {
    it('applies regular width (default)', () => {
      render(<Button intent="primary">Regular</Button>);
      expect(screen.getByRole('button')).toHaveClass('ui:w-auto');
    });

    it('applies full width', () => {
      render(
        <Button intent="primary" width="full">
          Full width
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ui:w-full', 'ui:justify-between');
    });
  });

  describe('Disabled state', () => {
    it('applies disabled styles and attribute', () => {
      render(
        <Button intent="primary" disabled>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass(
        'ui:disabled:cursor-not-allowed',
        'ui:disabled:opacity-50'
      );
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner and disables button', () => {
      render(
        <Button intent="primary" isLoading>
          Loading
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass(
        'ui:disabled:cursor-not-allowed',
        'ui:disabled:opacity-50'
      );
    });

    it('shows loading text when provided', () => {
      render(
        <Button intent="primary" isLoading loadingText="Processing...">
          Submit
        </Button>
      );
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('hides original content when loading with loadingText', () => {
      const { container } = render(
        <Button intent="primary" isLoading loadingText="Loading...">
          Original text
        </Button>
      );
      const contentDiv = container.querySelector('.ui\\:hidden');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      render(
        <Button
          intent="primary"
          leftIcon={<Icon name="arrow-left-line" size="sm" />}
        >
          Back
        </Button>
      );
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      render(
        <Button
          intent="primary"
          rightIcon={<Icon name="arrow-right-line" size="sm" />}
        >
          Next
        </Button>
      );
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('renders with both left and right icons', () => {
      render(
        <Button
          intent="primary"
          leftIcon={<Icon name="arrow-left-line" size="sm" />}
          rightIcon={<Icon name="arrow-right-line" size="sm" />}
        >
          Both icons
        </Button>
      );
      expect(screen.getByText('Both icons')).toBeInTheDocument();
    });
  });

  describe('Custom attributes', () => {
    it('forwards custom className', () => {
      render(
        <Button intent="primary" className="custom-class">
          Custom
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('forwards onClick handler', () => {
      const handleClick = vi.fn();
      render(
        <Button intent="primary" onClick={handleClick}>
          Click
        </Button>
      );
      screen.getByRole('button').click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('forwards ref', () => {
      const ref = vi.fn();
      render(
        <Button intent="primary" ref={ref}>
          Ref test
        </Button>
      );
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });
});
