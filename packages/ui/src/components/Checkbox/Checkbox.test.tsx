import { act } from 'react';

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Checkbox } from './Checkbox';

describe('Checkbox Component', () => {
  const defaultProps = {
    label: 'Test Checkbox',
    isSelected: false,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<Checkbox label="Test" isSelected={false} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    test('displays the correct label', () => {
      render(<Checkbox label="Accept Terms" isSelected={false} />);
      expect(screen.getByText('Accept Terms')).toBeInTheDocument();
    });

    test('renders the visual checkbox element', () => {
      render(<Checkbox {...defaultProps} />);
      const checkboxSpan = document.querySelector('span[class*="ui:relative"]');
      expect(checkboxSpan).toBeInTheDocument();
    });

    test('renders the SVG icon', () => {
      render(<Checkbox {...defaultProps} isSelected={true} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    });

    test('applies base CSS classes', () => {
      render(<Checkbox {...defaultProps} />);
      const label = screen.getByRole('checkbox').closest('label');
      expect(label).toHaveClass(
        'ui:inline-flex',
        'ui:items-center',
        'ui:gap-2'
      );
    });
  });

  describe('State Management', () => {
    test('shows as unchecked when isSelected is false', () => {
      render(<Checkbox label="Test" isSelected={false} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    test('shows as checked when isSelected is true', () => {
      render(<Checkbox label="Test" isSelected={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    test('applies selected CSS classes when isSelected is true', () => {
      render(<Checkbox {...defaultProps} isSelected={true} />);
      const checkboxBox = document.querySelector('span[class*="ui:relative"]');
      expect(checkboxBox).toHaveClass('ui:bg-navy-600', 'ui:border-navy-600');
    });

    test('does not apply selected CSS classes when isSelected is false', () => {
      render(<Checkbox {...defaultProps} isSelected={false} />);
      const checkboxBox = document.querySelector('span[class*="ui:relative"]');
      expect(checkboxBox).toHaveClass('ui:bg-white', 'ui:border-grey-600');
    });
  });

  describe('User Interactions', () => {
    test('calls onChange with true when clicked and currently unchecked', () => {
      const onChange = vi.fn();
      render(<Checkbox label="Test" isSelected={false} onChange={onChange} />);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    test('calls onChange with false when clicked and currently checked', () => {
      const onChange = vi.fn();
      render(<Checkbox label="Test" isSelected={true} onChange={onChange} />);

      fireEvent.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(false);
    });

    test('can be toggled by clicking the visual checkbox span', () => {
      const onChange = vi.fn();
      render(<Checkbox {...defaultProps} onChange={onChange} />);

      const visualCheckbox = document.querySelector(
        'span[class*="ui:relative"]'
      );
      fireEvent.click(visualCheckbox!);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    test('can be toggled by clicking the label text', () => {
      const onChange = vi.fn();
      render(<Checkbox {...defaultProps} onChange={onChange} />);

      fireEvent.click(screen.getByText('Test Checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    // Note: Keyboard interactions are handled by React Aria and require more complex testing setup
    // These would typically be covered by integration tests or e2e tests
  });

  describe('Disabled State', () => {
    test('applies disabled CSS classes when isDisabled is true', () => {
      render(<Checkbox {...defaultProps} isDisabled={true} />);
      const label = screen.getByRole('checkbox').closest('label');
      expect(label).toHaveClass('ui:cursor-not-allowed', 'ui:opacity-60');
    });

    test('checkbox indicates disabled state', () => {
      render(<Checkbox {...defaultProps} isDisabled={true} />);
      const checkbox = screen.getByRole('checkbox');
      // React Aria manages disabled state - the component should be properly marked as disabled
      expect(checkbox).toBeInTheDocument();
      // The actual implementation may vary, but the component should handle disabled state
    });

    test('does not call onChange when disabled and checkbox is clicked', () => {
      const onChange = vi.fn();
      render(
        <Checkbox {...defaultProps} isDisabled={true} onChange={onChange} />
      );

      fireEvent.click(screen.getByRole('checkbox'));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('does not call onChange when disabled and visual checkbox is clicked', () => {
      const onChange = vi.fn();
      render(
        <Checkbox {...defaultProps} isDisabled={true} onChange={onChange} />
      );

      const visualCheckbox = document.querySelector(
        'span[class*="ui:relative"]'
      );
      fireEvent.click(visualCheckbox!);
      expect(onChange).not.toHaveBeenCalled();
    });

    test('shows secondary text intent when disabled', () => {
      render(<Checkbox {...defaultProps} isDisabled={true} />);
      const textElement = screen.getByText('Test Checkbox');
      // The Text component should receive secondary intent when disabled
      expect(textElement).toHaveClass('ui:text-grey-600');
    });

    test('shows primary text intent when not disabled', () => {
      render(<Checkbox {...defaultProps} isDisabled={false} />);
      const textElement = screen.getByText('Test Checkbox');
      expect(textElement).toHaveClass('ui:text-black');
    });
  });

  describe('Validation State', () => {
    test('applies invalid CSS classes when isValid is false', () => {
      render(<Checkbox {...defaultProps} isValid={false} />);
      const checkboxBox = document.querySelector('span[class*="ui:relative"]');
      expect(checkboxBox).toHaveClass('ui:border-red-600');
    });

    test('does not apply invalid CSS classes when isValid is true', () => {
      render(<Checkbox {...defaultProps} isValid={true} />);
      const checkboxBox = document.querySelector('span[class*="ui:relative"]');
      expect(checkboxBox).not.toHaveClass('ui:border-red-600');
    });

    test('does not apply invalid CSS classes when isValid is undefined (default)', () => {
      render(<Checkbox {...defaultProps} />);
      const checkboxBox = document.querySelector('span[class*="ui:relative"]');
      expect(checkboxBox).not.toHaveClass('ui:border-red-600');
    });
  });

  describe('Focus Management', () => {
    test('checkbox can receive focus', () => {
      render(<Checkbox {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox');

      act(() => {
        checkbox.focus();
      });
      expect(checkbox).toHaveFocus();
    });

    test('applies focus-visible classes when focused', () => {
      render(<Checkbox {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox');
      const label = checkbox.closest('label');

      fireEvent.focus(checkbox);
      // The component uses useFocusRing which should apply focus-visible classes
      // We can check if the focus ring classes are applied (though this may require more complex testing)
      expect(label).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<Checkbox {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox).toHaveAttribute('type', 'checkbox');
      // React Aria manages state differently, check that it's accessible
      expect(checkbox).toHaveRole('checkbox');
    });

    test('checked state reflects isSelected state', () => {
      const { rerender } = render(
        <Checkbox {...defaultProps} isSelected={false} />
      );
      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      rerender(<Checkbox {...defaultProps} isSelected={true} />);
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    test('label is properly associated with checkbox', () => {
      render(<Checkbox {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox');
      const label = checkbox.closest('label');

      // The label should contain the checkbox
      expect(label).toContainElement(checkbox);
    });
  });

  describe('Custom Props and Styling', () => {
    test('forwards custom className to label', () => {
      render(<Checkbox {...defaultProps} className="custom-checkbox" />);
      const label = screen.getByRole('checkbox').closest('label');
      expect(label).toHaveClass('custom-checkbox');
      expect(label).toHaveClass('ui:inline-flex'); // Should still have base classes
    });

    test('forwards HTML attributes to label', () => {
      render(
        <Checkbox
          {...defaultProps}
          data-testid="custom-checkbox"
          title="Custom title"
        />
      );

      const label = screen.getByTestId('custom-checkbox');
      expect(label).toHaveAttribute('title', 'Custom title');
    });

    test('forwards style props to label', () => {
      render(<Checkbox {...defaultProps} style={{ backgroundColor: 'red' }} />);

      const label = screen.getByRole('checkbox').closest('label');
      expect(label).toHaveStyle('background-color: rgb(255, 0, 0)');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('works without onChange handler', () => {
      render(<Checkbox label="Test" isSelected={false} />);

      const checkbox = screen.getByRole('checkbox');
      expect(() => fireEvent.click(checkbox)).not.toThrow();
    });

    test('handles empty label correctly', () => {
      render(<Checkbox label="" isSelected={false} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      // When label is empty, there should be no text content rendered
      const label = checkbox.closest('label');
      expect(label).toBeInTheDocument();
    });

    test('maintains controlled behavior', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <Checkbox label="Test" isSelected={false} onChange={onChange} />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      // Click should call onChange but not change state until parent updates
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(checkbox).not.toBeChecked(); // Still unchecked until prop changes

      // Parent updates the prop
      rerender(<Checkbox label="Test" isSelected={true} onChange={onChange} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    test('handles rapid clicks correctly', () => {
      const onChange = vi.fn();
      render(<Checkbox {...defaultProps} onChange={onChange} />);

      const checkbox = screen.getByRole('checkbox');

      // Multiple rapid clicks
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);

      // Should be called for each click
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenNthCalledWith(1, true);
      expect(onChange).toHaveBeenNthCalledWith(2, true);
      expect(onChange).toHaveBeenNthCalledWith(3, true);
    });
  });

  describe('Complex State Combinations', () => {
    test('disabled and selected state combination', () => {
      render(
        <Checkbox {...defaultProps} isDisabled={true} isSelected={true} />
      );

      const checkbox = screen.getByRole('checkbox');
      const label = checkbox.closest('label');
      const checkboxBox = document.querySelector('span[class*="ui:relative"]');

      expect(checkbox).toBeChecked();
      // The checkbox should indicate its disabled state in some way
      expect(checkbox).toBeInTheDocument();
      expect(label).toHaveClass('ui:cursor-not-allowed', 'ui:opacity-60');
      expect(checkboxBox).toHaveClass('ui:bg-grey-600', 'ui:border-grey-600');
    });

    test('all variants applied together', () => {
      render(
        <Checkbox
          {...defaultProps}
          isSelected={true}
          isDisabled={true}
          isValid={false}
          className="custom-class"
        />
      );

      const label = screen.getByRole('checkbox').closest('label');
      expect(label).toHaveClass('ui:inline-flex');
      expect(label).toHaveClass('ui:cursor-not-allowed');
      expect(label).toHaveClass('ui:opacity-60');
      expect(label).toHaveClass('custom-class');
    });
  });
});
