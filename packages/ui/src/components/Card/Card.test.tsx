import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Card } from './Card';

describe('Card Component', () => {
  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<Card>Test content</Card>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Custom Props and Styling', () => {
    test('forwards custom className', () => {
      render(
        <Card className="custom-card-class" data-testid="card">
          Test content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card-class');
      expect(card).toHaveClass('ui:bg-white'); // Should still have base classes
    });

    test('merges custom classes with variant classes', () => {
      render(
        <Card
          padding="lg"
          shadow="lg"
          border="medium"
          className="custom-class another-class"
          data-testid="card"
        >
          Test content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('ui:p-8'); // padding variant
      expect(card).toHaveClass('ui:shadow-lg'); // shadow variant
      expect(card).toHaveClass('ui:border-2'); // border variant
      expect(card).toHaveClass('custom-class', 'another-class'); // custom classes
    });

    test('forwards HTML attributes', () => {
      render(
        <Card
          data-testid="custom-card"
          id="test-card"
          role="article"
          aria-label="Test card"
        >
          Test content
        </Card>
      );
      const card = screen.getByTestId('custom-card');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-label', 'Test card');
    });

    test('forwards style props', () => {
      render(
        <Card
          style={{ backgroundColor: 'red', minHeight: '200px' }}
          data-testid="card"
        >
          Test content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveStyle('background-color: rgb(255, 0, 0)');
      expect(card).toHaveStyle('min-height: 200px');
    });

    test('forwards event handlers', () => {
      const handleClick = vi.fn();
      const handleMouseEnter = vi.fn();

      render(
        <Card
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          data-testid="card"
        >
          Test content
        </Card>
      );

      const card = screen.getByTestId('card');

      card.click();
      expect(handleClick).toHaveBeenCalledTimes(1);

      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe('Combined Variants', () => {
    test('applies all variants together correctly', () => {
      render(
        <Card
          padding="lg"
          shadow="none"
          border="medium"
          className="test-combination"
          data-testid="card"
        >
          Combined variants test
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass(
        // Base classes
        'ui:bg-white',
        'ui:rounded-lg',
        'ui:transition-colors',
        // Variant classes
        'ui:p-8', // lg padding
        'ui:shadow-none', // none shadow
        'ui:border-2', // medium border
        // Custom class
        'test-combination'
      );
    });
  });
});
