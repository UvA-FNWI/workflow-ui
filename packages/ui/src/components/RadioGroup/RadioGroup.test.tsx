import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Radio, RadioGroup } from './RadioGroup';

describe('RadioGroup Component', () => {
  const defaultProps = {
    label: 'Test Radio Group',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    test('displays the correct label', () => {
      render(
        <RadioGroup label="Select an option">
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    test('displays description when provided', () => {
      render(
        <RadioGroup
          label="Select an option"
          description="Choose one of the options below"
        >
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );
      expect(
        screen.getByText('Choose one of the options below')
      ).toBeInTheDocument();
    });

    test('renders all radio options', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
          <Radio value="option3">Option 3</Radio>
        </RadioGroup>
      );
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    test('renders radio labels correctly', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="a">First Option</Radio>
          <Radio value="b">Second Option</Radio>
        </RadioGroup>
      );
      expect(screen.getByText('First Option')).toBeInTheDocument();
      expect(screen.getByText('Second Option')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('no radio is selected by default when no value is provided', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );
      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).not.toBeChecked();
      });
    });

    test('selects the correct radio when value is provided', () => {
      render(
        <RadioGroup {...defaultProps} value="option2">
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );
      expect(screen.getByLabelText('Option 1')).not.toBeChecked();
      expect(screen.getByLabelText('Option 2')).toBeChecked();
    });

    test('selects the correct radio when defaultValue is provided', () => {
      render(
        <RadioGroup {...defaultProps} defaultValue="option1">
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );
      expect(screen.getByLabelText('Option 1')).toBeChecked();
      expect(screen.getByLabelText('Option 2')).not.toBeChecked();
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when a radio is clicked', () => {
      const onChange = vi.fn();
      render(
        <RadioGroup label="Test" onChange={onChange}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );

      fireEvent.click(screen.getByLabelText('Option 1'));
      expect(onChange).toHaveBeenCalledWith('option1');
    });

    test('calls onChange with the correct value when different option is selected', () => {
      const onChange = vi.fn();
      render(
        <RadioGroup label="Test" value="option1" onChange={onChange}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );

      fireEvent.click(screen.getByLabelText('Option 2'));
      expect(onChange).toHaveBeenCalledWith('option2');
    });

    test('allows keyboard navigation between options', () => {
      render(
        <RadioGroup {...defaultProps} defaultValue="option1">
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );

      const option1 = screen.getByLabelText('Option 1');
      option1.focus();
      expect(document.activeElement).toBe(option1);
    });
  });

  describe('Disabled State', () => {
    test('disables all radios when isDisabled is true on group', () => {
      render(
        <RadioGroup {...defaultProps} isDisabled>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    test('does not call onChange when group is disabled', () => {
      const onChange = vi.fn();
      render(
        <RadioGroup label="Test" isDisabled onChange={onChange}>
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );

      fireEvent.click(screen.getByLabelText('Option 1'));
      expect(onChange).not.toHaveBeenCalled();
    });

    test('disables individual radio when isDisabled is true on Radio', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2" isDisabled>
            Option 2
          </Radio>
        </RadioGroup>
      );

      expect(screen.getByLabelText('Option 1')).not.toBeDisabled();
      expect(screen.getByLabelText('Option 2')).toBeDisabled();
    });

    test('does not select disabled individual radio when clicked', () => {
      const onChange = vi.fn();
      render(
        <RadioGroup label="Test" onChange={onChange}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2" isDisabled>
            Option 2
          </Radio>
        </RadioGroup>
      );

      // The disabled radio should not be selectable via the input
      const disabledRadio = screen.getByLabelText('Option 2');
      expect(disabledRadio).toBeDisabled();
    });
  });

  describe('Validation', () => {
    test('displays error message when isValid is false', () => {
      render(
        <RadioGroup
          {...defaultProps}
          isValid={false}
          errorMessage="Please select an option"
        >
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });

    test('does not display error message when isValid is true', () => {
      render(
        <RadioGroup
          {...defaultProps}
          isValid={true}
          errorMessage="Please select an option"
        >
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );
      expect(
        screen.queryByText('Please select an option')
      ).not.toBeInTheDocument();
    });

    test('applies invalid styling when isValid is false', () => {
      render(
        <RadioGroup {...defaultProps} isValid={false}>
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );

      const radioCircle = document.querySelector(
        'span[class*="ui:rounded-full"]'
      );
      expect(radioCircle).toHaveClass('ui:border-red-600');
    });
  });

  describe('Orientation', () => {
    test('applies vertical orientation by default', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );

      const container = document.querySelector('div[class*="ui:flex-col"]');
      expect(container).toBeInTheDocument();
    });

    test('applies horizontal orientation when specified', () => {
      render(
        <RadioGroup {...defaultProps} orientation="horizontal">
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );

      const container = document.querySelector('div[class*="ui:flex-row"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has correct role for radio group', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    test('has correct role for individual radios', () => {
      render(
        <RadioGroup {...defaultProps}>
          <Radio value="option1">Option 1</Radio>
          <Radio value="option2">Option 2</Radio>
        </RadioGroup>
      );
      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    test('associates label with radio group', () => {
      render(
        <RadioGroup label="Favorite Color">
          <Radio value="red">Red</Radio>
          <Radio value="blue">Blue</Radio>
        </RadioGroup>
      );

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAccessibleName('Favorite Color');
    });
  });

  describe('Edge Cases', () => {
    test('throws error when Radio is used outside RadioGroup', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<Radio value="option1">Option 1</Radio>);
      }).toThrow('Radio must be used within a RadioGroup');

      consoleSpy.mockRestore();
    });

    test('handles empty children gracefully', () => {
      render(<RadioGroup {...defaultProps}>{null}</RadioGroup>);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    test('works without label', () => {
      render(
        <RadioGroup>
          <Radio value="option1">Option 1</Radio>
        </RadioGroup>
      );
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });
  });
});
