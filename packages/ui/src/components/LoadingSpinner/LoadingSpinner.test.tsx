import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    test('renders with default accessibility label', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('has sr-only text for screen readers', () => {
      render(<LoadingSpinner />);
      const hiddenText = screen.getByText('Loading...');
      expect(hiddenText).toHaveClass('ui:sr-only');
    });
  });

  describe('Size Variants', () => {
    test.each([
      ['xs', 'ui:w-4 ui:h-4 ui:border-2'],
      ['sm', 'ui:w-6 ui:h-6 ui:border-2'],
      ['md', 'ui:w-8 ui:h-8 ui:border-2'],
      ['lg', 'ui:w-12 ui:h-12 ui:border-2'],
      ['xl', 'ui:w-16 ui:h-16 ui:border-2'],
      ['2xl', 'ui:w-20 ui:h-20 ui:border-2'],
    ])('applies correct classes for %s size', (size, expectedClasses) => {
      render(<LoadingSpinner size={size as any} data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expectedClasses.split(' ').forEach(className => {
        expect(spinner).toHaveClass(className);
      });
    });

    test('applies default size when size prop is not provided', () => {
      render(<LoadingSpinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('ui:w-8', 'ui:h-8', 'ui:border-2');
    });
  });

  describe('Animation and Base Classes', () => {
    test('applies base animation and styling classes', () => {
      render(<LoadingSpinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass(
        'ui:rounded-full',
        'ui:border-solid',
        'ui:animate-spin'
      );
    });
  });

  describe('Accessibility', () => {
    test('has correct role for screen readers', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    test('accepts custom accessibility label', () => {
      const customLabel = 'Loading user data...';
      render(<LoadingSpinner label={customLabel} />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', customLabel);
      expect(screen.getByText(customLabel)).toBeInTheDocument();
    });

    test('provides accessible text for screen readers', () => {
      const customLabel = 'Processing request';
      render(<LoadingSpinner label={customLabel} />);
      const hiddenText = screen.getByText(customLabel);
      expect(hiddenText).toHaveClass('ui:sr-only');
    });
  });

  describe('Custom Props', () => {
    test('forwards custom className', () => {
      render(
        <LoadingSpinner className="custom-spinner" data-testid="spinner" />
      );
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('custom-spinner');
      expect(spinner).toHaveClass('ui:animate-spin'); // Should still have base classes
    });

    test('forwards HTML attributes', () => {
      render(
        <LoadingSpinner
          data-testid="custom-spinner"
          id="spinner-element"
          title="Loading spinner"
        />
      );
      const spinner = screen.getByTestId('custom-spinner');
      expect(spinner).toHaveAttribute('id', 'spinner-element');
      expect(spinner).toHaveAttribute('title', 'Loading spinner');
    });

    test('forwards style prop', () => {
      render(
        <LoadingSpinner
          style={{ margin: '10px', opacity: 0.5 }}
          data-testid="spinner"
        />
      );
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveStyle('margin: 10px');
      expect(spinner).toHaveStyle('opacity: 0.5');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty label gracefully', () => {
      render(<LoadingSpinner label="" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', '');
      const hiddenText = spinner.querySelector('span.ui\\:sr-only');
      expect(hiddenText).toBeInTheDocument();
      expect(hiddenText).toHaveClass('ui:sr-only');
    });

    test('handles very long labels', () => {
      const longLabel =
        'Loading a very long piece of content that might take a while to process and display to the user';
      render(<LoadingSpinner label={longLabel} />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', longLabel);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });
});
