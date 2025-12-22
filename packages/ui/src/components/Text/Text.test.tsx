import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Text } from './Text';

describe('Text Component', () => {
  describe('Basic Rendering', () => {
    test('renders text content', () => {
      render(<Text>Hello World</Text>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    test('renders as paragraph by default', () => {
      render(<Text>Test content</Text>);
      const element = screen.getByText('Test content');
      expect(element.tagName).toBe('P');
    });

    test('applies default classes', () => {
      render(<Text>Test content</Text>);
      const element = screen.getByText('Test content');
      expect(element).toHaveClass('ui:font-body');
      expect(element).toHaveClass('ui:inline-block'); // default display variant
      expect(element).toHaveClass('ui:p-0');
      expect(element).toHaveClass('ui:m-0');
    });
  });

  describe('HTML Element Variants', () => {
    test('renders as span when as="span"', () => {
      render(<Text as="span">Span text</Text>);
      const element = screen.getByText('Span text');
      expect(element.tagName).toBe('SPAN');
    });

    test('renders as bold when as="b"', () => {
      render(<Text as="b">Bold text</Text>);
      const element = screen.getByText('Bold text');
      expect(element.tagName).toBe('B');
    });

    test('renders as ui:italic when as="i"', () => {
      render(<Text as="i">Italic text</Text>);
      const element = screen.getByText('Italic text');
      expect(element.tagName).toBe('I');
    });

    test('renders as paragraph when as="p"', () => {
      render(<Text as="p">Paragraph text</Text>);
      const element = screen.getByText('Paragraph text');
      expect(element.tagName).toBe('P');
    });
  });

  describe('Intent Variants', () => {
    test('applies primary intent by default', () => {
      render(<Text>Primary text</Text>);
      const element = screen.getByText('Primary text');
      expect(element).toHaveClass('ui:text-black');
    });

    test('applies primary intent when explicitly set', () => {
      render(<Text intent="primary">Primary text</Text>);
      const element = screen.getByText('Primary text');
      expect(element).toHaveClass('ui:text-black');
    });

    test('applies secondary intent', () => {
      render(<Text intent="secondary">Secondary text</Text>);
      const element = screen.getByText('Secondary text');
      expect(element).toHaveClass('ui:text-grey-600');
    });
  });

  describe('Size Variants', () => {
    test('applies extra small size', () => {
      render(<Text size="xs">XS text</Text>);
      const element = screen.getByText('XS text');
      expect(element).toHaveClass('ui:text-xs');
    });

    test('applies small size', () => {
      render(<Text size="sm">Small text</Text>);
      const element = screen.getByText('Small text');
      expect(element).toHaveClass('ui:text-sm');
    });

    test('applies large size', () => {
      render(<Text size="lg">Large text</Text>);
      const element = screen.getByText('Large text');
      expect(element).toHaveClass('ui:text-lg');
    });

    test('applies extra large size', () => {
      render(<Text size="xl">XL text</Text>);
      const element = screen.getByText('XL text');
      expect(element).toHaveClass('ui:text-xl');
    });

    test('applies 2xl size', () => {
      render(<Text size="2xl">2XL text</Text>);
      const element = screen.getByText('2XL text');
      expect(element).toHaveClass('ui:text-2xl');
    });

    test('applies 3xl size', () => {
      render(<Text size="3xl">3XL text</Text>);
      const element = screen.getByText('3XL text');
      expect(element).toHaveClass('ui:text-3xl');
    });
  });

  describe('Text Decoration Variants', () => {
    test('applies no decoration by default', () => {
      render(<Text>No decoration</Text>);
      const element = screen.getByText('No decoration');
      expect(element).toHaveClass('ui:no-underline');
    });

    test('applies ui:underline decoration', () => {
      render(<Text decoration="underline">Underlined text</Text>);
      const element = screen.getByText('Underlined text');
      expect(element).toHaveClass('ui:underline');
    });

    test('applies ui:line-through decoration', () => {
      render(<Text decoration="line-through">Strikethrough text</Text>);
      const element = screen.getByText('Strikethrough text');
      expect(element).toHaveClass('ui:line-through');
    });

    test('applies none decoration when explicitly set', () => {
      render(<Text decoration="none">No decoration</Text>);
      const element = screen.getByText('No decoration');
      expect(element).toHaveClass('ui:no-underline');
    });
  });

  describe('Text Transform Variants', () => {
    test('applies no ui:transform by default', () => {
      render(<Text>Normal case</Text>);
      const element = screen.getByText('Normal case');
      expect(element).toHaveClass('ui:normal-case');
    });

    test('applies ui:uppercase ui:transform', () => {
      render(<Text textTransform="uppercase">Uppercase text</Text>);
      const element = screen.getByText('Uppercase text');
      expect(element).toHaveClass('ui:uppercase');
    });

    test('applies ui:lowercase ui:transform', () => {
      render(<Text textTransform="lowercase">Lowercase text</Text>);
      const element = screen.getByText('Lowercase text');
      expect(element).toHaveClass('ui:lowercase');
    });

    test('applies ui:capitalize ui:transform', () => {
      render(<Text textTransform="capitalize">Capitalize text</Text>);
      const element = screen.getByText('Capitalize text');
      expect(element).toHaveClass('ui:capitalize');
    });

    test('applies none ui:transform when explicitly set', () => {
      render(<Text textTransform="none">Normal case</Text>);
      const element = screen.getByText('Normal case');
      expect(element).toHaveClass('ui:normal-case');
    });
  });

  describe('Truncate Functionality', () => {
    test('does not ui:truncate by default', () => {
      render(<Text>Long text content</Text>);
      const element = screen.getByText('Long text content');
      expect(element).not.toHaveClass('ui:truncate');
    });

    test('applies ui:truncate class when ui:truncate is true', () => {
      render(<Text truncate={true}>Long text content</Text>);
      const element = screen.getByText('Long text content');
      expect(element).toHaveClass('ui:overflow-hidden');
      expect(element).toHaveClass('ui:text-ellipsis');
      expect(element).toHaveClass('ui:whitespace-nowrap');
      expect(element).toHaveClass('ui:w-full');
    });

    test('does not apply ui:truncate class when ui:truncate is false', () => {
      render(<Text truncate={false}>Normal text</Text>);
      const element = screen.getByText('Normal text');
      expect(element).not.toHaveClass('ui:overflow-hidden');
      expect(element).not.toHaveClass('ui:text-ellipsis');
      expect(element).not.toHaveClass('ui:whitespace-nowrap');
      expect(element).not.toHaveClass('ui:w-full');
    });

    test('sets title to children content when ui:truncated and no title provided', () => {
      render(<Text truncate={true}>Long text that will be ui:truncated</Text>);
      const element = screen.getByText('Long text that will be ui:truncated');
      expect(element).toHaveAttribute(
        'title',
        'Long text that will be ui:truncated'
      );
    });

    test('uses provided title when ui:truncated and title is explicitly set', () => {
      render(
        <Text truncate={true} title="Custom title">
          Long text content
        </Text>
      );
      const element = screen.getByText('Long text content');
      expect(element).toHaveAttribute('title', 'Custom title');
    });

    test('uses provided title when not ui:truncated', () => {
      render(<Text title="Custom title">Normal text</Text>);
      const element = screen.getByText('Normal text');
      expect(element).toHaveAttribute('title', 'Custom title');
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(<Text className="custom-class">Custom styled text</Text>);
      const element = screen.getByText('Custom styled text');
      expect(element).toHaveClass('custom-class');
      expect(element).toHaveClass('ui:font-body'); // Should still have base class
    });

    test('forwards HTML attributes', () => {
      render(
        <Text data-testid="custom-text" id="text-element">
          Text with attributes
        </Text>
      );
      const element = screen.getByTestId('custom-text');
      expect(element).toHaveAttribute('id', 'text-element');
    });

    test('forwards style prop', () => {
      render(
        <Text
          style={{
            backgroundColor: 'rgb(255, 0, 0)',
            color: 'rgb(255, 255, 255)',
          }}
        >
          Styled text
        </Text>
      );
      const element = screen.getByText('Styled text');
      expect(element).toHaveStyle('background-color: rgb(255, 0, 0)');
      expect(element).toHaveStyle('color: rgb(255, 255, 255)');
    });
  });

  describe('Multiple Variants Combination', () => {
    test('combines multiple variants correctly', () => {
      render(
        <Text
          intent="secondary"
          size="lg"
          decoration="underline"
          textTransform="uppercase"
          truncate={true}
        >
          Complex text
        </Text>
      );
      const element = screen.getByText('Complex text');
      expect(element).toHaveClass('ui:text-grey-600');
      expect(element).toHaveClass('ui:text-lg');
      expect(element).toHaveClass('ui:underline');
      expect(element).toHaveClass('ui:uppercase');
      expect(element).toHaveClass('ui:overflow-hidden');
      expect(element).toHaveClass('ui:text-ellipsis');
      expect(element).toHaveClass('ui:whitespace-nowrap');
      expect(element).toHaveClass('ui:w-full');
    });

    test('combines HTML element type with variants', () => {
      render(
        <Text as="span" size="xl" intent="primary" decoration="underline">
          Span with variants
        </Text>
      );
      const element = screen.getByText('Span with variants');
      expect(element.tagName).toBe('SPAN');
      expect(element).toHaveClass('ui:text-xl');
      expect(element).toHaveClass('ui:text-black');
      expect(element).toHaveClass('ui:underline');
    });
  });

  describe('Content Handling', () => {
    test('renders string content', () => {
      render(<Text>Simple string</Text>);
      expect(screen.getByText('Simple string')).toBeInTheDocument();
    });

    test('renders number content', () => {
      render(<Text>{42}</Text>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    test('renders mixed content', () => {
      render(
        <Text>
          Text with <em>emphasis</em> and numbers: {123}
        </Text>
      );
      expect(screen.getByText(/Text with/)).toBeInTheDocument();
      expect(screen.getByText('emphasis')).toBeInTheDocument();
    });

    test('handles empty content', () => {
      const { container } = render(<Text></Text>);
      const element = container.querySelector('p[class*="ui:font-body"]');
      expect(element).not.toBeNull();
      if (element) {
        const htmlElement = element as HTMLElement;
        expect(htmlElement).toBeInTheDocument();
        expect(htmlElement).toBeEmptyDOMElement();
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined children gracefully', () => {
      const { container } = render(<Text>{undefined}</Text>);
      const element = container.querySelector('p[class*="ui:font-body"]');
      expect(element).not.toBeNull();
      if (element) {
        const htmlElement = element as HTMLElement;
        expect(htmlElement).toBeInTheDocument();
      }
    });

    test('handles null children gracefully', () => {
      const { container } = render(<Text>{null}</Text>);
      const element = container.querySelector('p[class*="ui:font-body"]');
      expect(element).not.toBeNull();
      if (element) {
        const htmlElement = element as HTMLElement;
        expect(htmlElement).toBeInTheDocument();
      }
    });

    test('applies all default variants when no props provided', () => {
      render(<Text>Default text</Text>);
      const element = screen.getByText('Default text');
      expect(element).toHaveClass('ui:font-body');
      expect(element).toHaveClass('ui:text-black');
      expect(element).toHaveClass('ui:text-base');
      expect(element).toHaveClass('ui:no-underline');
      expect(element).toHaveClass('ui:normal-case');
      expect(element).toHaveClass('ui:inline-block'); // default display
      expect(element).not.toHaveClass('ui:overflow-hidden');
    });
  });

  describe('Display Variants', () => {
    test('applies inline display variant', () => {
      render(<Text display="inline">Inline text</Text>);
      const element = screen.getByText('Inline text');
      expect(element).toHaveClass('ui:inline');
    });

    test('applies inline-block display variant (default)', () => {
      render(<Text display="inline-block">Inline-block text</Text>);
      const element = screen.getByText('Inline-block text');
      expect(element).toHaveClass('ui:inline-block');
    });

    test('applies block display variant', () => {
      render(<Text display="block">Block text</Text>);
      const element = screen.getByText('Block text');
      expect(element).toHaveClass('ui:block');
    });

    test('uses default display when display prop is not provided', () => {
      render(<Text>Default display text</Text>);
      const element = screen.getByText('Default display text');
      expect(element).toHaveClass('ui:inline-block');
    });
  });
});
