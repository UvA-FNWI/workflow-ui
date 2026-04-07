import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { Callout } from './Callout';

describe('Callout Component', () => {
  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      render(<Callout>Test content</Callout>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('renders with header', () => {
      render(<Callout header="Test Header">Test content</Callout>);
      expect(screen.getByText('Test Header')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('renders with action', () => {
      render(<Callout action="Click me">Test content</Callout>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });

  describe('Type Variants', () => {
    test.each([
      ['info', 'ui:bg-sky-200 ui:border-l-sky-600'],
      ['error', 'ui:bg-red-200 ui:border-l-red-600'],
      ['warning', 'ui:bg-orange-200 ui:border-l-orange-600'],
      ['success', 'ui:bg-forest-200 ui:border-l-forest-600'],
      ['note', 'ui:bg-grey-300 ui:border-l-grey-600'],
    ])('applies correct classes for %s type', (type, expectedClasses) => {
      render(
        <Callout type={type as any} data-testid="callout">
          Test content
        </Callout>
      );
      const callout = screen.getByTestId('callout');
      expectedClasses.split(' ').forEach(className => {
        expect(callout).toHaveClass(className);
      });
    });
  });

  describe('Icons', () => {
    test('renders default icon for each type', () => {
      render(<Callout type="info">Test content</Callout>);
      // Check for the mocked Icon component
      expect(screen.getByTestId('icon-square-info-line')).toBeInTheDocument();
    });

    test('renders custom icon when provided', () => {
      render(
        <Callout icon={<span data-testid="custom-icon">Custom</span>}>
          Test content
        </Callout>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      // Should not render the default icon
      expect(
        screen.queryByTestId('icon-square-info-line')
      ).not.toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    test('renders close button when isCloseable is true', () => {
      render(<Callout isCloseable>Test content</Callout>);
      // Look for the close button icon
      expect(screen.getByTestId('icon-cross-line')).toBeInTheDocument();
    });

    test('does not render close button by default', () => {
      render(<Callout>Test content</Callout>);
      // Should only have the type icon, not the close icon
      expect(screen.getByTestId('icon-square-info-line')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-cross-line')).not.toBeInTheDocument();
    });

    test('hides callout when close button is clicked', () => {
      render(
        <Callout isCloseable data-testid="callout">
          Test content
        </Callout>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();

      // Find the close button container by its classes
      const closeContainer = document.querySelector(
        '.ui\\:cursor-pointer'
      ) as HTMLElement;
      fireEvent.click(closeContainer);

      expect(screen.queryByText('Test content')).not.toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    test('forwards custom className', () => {
      render(
        <Callout className="custom-class" data-testid="callout">
          Test content
        </Callout>
      );
      const callout = screen.getByTestId('callout');
      expect(callout).toHaveClass('custom-class');
      expect(callout).toHaveClass('ui:relative'); // Should still have base classes
    });

    test('forwards HTML attributes', () => {
      render(
        <Callout data-testid="custom-callout" id="test-callout" role="alert">
          Test content
        </Callout>
      );
      const callout = screen.getByTestId('custom-callout');
      expect(callout).toHaveAttribute('id', 'test-callout');
      expect(callout).toHaveAttribute('role', 'alert');
    });

    test('forwards event handlers', () => {
      const handleClick = vi.fn();
      render(
        <Callout onClick={handleClick} data-testid="callout">
          Test content
        </Callout>
      );

      fireEvent.click(screen.getByTestId('callout'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
