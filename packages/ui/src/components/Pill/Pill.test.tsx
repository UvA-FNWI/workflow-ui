import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { Icon } from '../Icon/Icon';
import { Pill } from './Pill';

describe('Pill Component', () => {
  describe('Basic Rendering', () => {
    test('renders with children text', () => {
      render(<Pill>Test Pill</Pill>);
      expect(screen.getByText('Test Pill')).toBeInTheDocument();
    });

    test('renders with default props', () => {
      render(<Pill>Default</Pill>);
      const pill = screen.getByText('Default');
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveClass('ui:bg-grey-300', 'ui:text-black'); // Default info type
      expect(pill).toHaveClass('ui:rounded-full'); // Default circular shape
    });
  });

  describe('Type Variants', () => {
    test('renders error type with correct classes', async () => {
      render(<Pill type="error">Error</Pill>);
      const pill = screen.getByText('Error');
      expect(pill).toHaveClass('ui:bg-red-600', 'ui:text-white');
      // Wait for any icon-related updates to complete
      await waitFor(() => {
        expect(pill).toBeInTheDocument();
      });
    });

    test('renders warning type with correct classes', async () => {
      render(<Pill type="warning">Warning</Pill>);
      const pill = screen.getByText('Warning');
      expect(pill).toHaveClass('ui:bg-orange-500', 'ui:text-black');
      // Wait for any icon-related updates to complete
      await waitFor(() => {
        expect(pill).toBeInTheDocument();
      });
    });

    test('renders info type with correct classes', () => {
      render(<Pill type="info">Info</Pill>);
      const pill = screen.getByText('Info');
      expect(pill).toHaveClass('ui:bg-grey-300', 'ui:text-black');
    });
  });

  describe('Shape Variants', () => {
    test('renders circular shape with correct classes', () => {
      render(<Pill shape="circular">Circular</Pill>);
      const pill = screen.getByText('Circular');
      expect(pill).toHaveClass('ui:rounded-full');
    });

    test('renders square shape with correct classes', () => {
      render(<Pill shape="square">Square</Pill>);
      const pill = screen.getByText('Square');
      expect(pill).toHaveClass('ui:rounded-md');
    });
  });

  describe('Color Variants', () => {
    test('renders red color with correct classes', () => {
      render(<Pill color="red">Red</Pill>);
      const pill = screen.getByText('Red');
      expect(pill).toHaveClass('ui:bg-red-200', 'ui:text-black');
    });

    test('renders blue color with correct classes', () => {
      render(<Pill color="blue">Blue</Pill>);
      const pill = screen.getByText('Blue');
      expect(pill).toHaveClass('ui:bg-navy-200', 'ui:text-black');
    });

    test('renders grey color with correct classes', () => {
      render(<Pill color="grey">Grey</Pill>);
      const pill = screen.getByText('Grey');
      expect(pill).toHaveClass('ui:bg-grey-300', 'ui:text-black');
    });
  });

  describe('Tag Feature', () => {
    test('renders with tag when provided', () => {
      render(<Pill tag="NEW">Tagged Pill</Pill>);
      expect(screen.getByText('Tagged Pill')).toBeInTheDocument();
      expect(screen.getByText('NEW')).toBeInTheDocument();
    });

    test('does not render tag when not provided', () => {
      render(<Pill>No Tag</Pill>);
      expect(screen.getByText('No Tag')).toBeInTheDocument();
      // Should not have any tag elements
      expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    });
  });

  describe('Icon Feature', () => {
    test('renders with custom icon when provided', async () => {
      const customIcon = (
        <Icon name="star-solid" size="sm" data-testid="custom-icon" />
      );
      render(<Pill icon={customIcon}>With Icon</Pill>);
      expect(screen.getByText('With Icon')).toBeInTheDocument();

      // Wait for icon to load properly
      await waitFor(() => {
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      });
    });

    test('renders default icon for error type', async () => {
      render(<Pill type="error">Error</Pill>);

      // Wait for the icon to be rendered
      await waitFor(() => {
        const pillContent = screen.getByText('Error').parentElement;
        expect(pillContent?.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('renders default icon for warning type', async () => {
      render(<Pill type="warning">Warning</Pill>);

      // Wait for the icon to be rendered
      await waitFor(() => {
        const pillContent = screen.getByText('Warning').parentElement;
        expect(pillContent?.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('does not render default icon for info type', () => {
      render(<Pill type="info">Info</Pill>);
      // Info type should not have a default icon
      const pillContent = screen.getByText('Info').parentElement;
      expect(pillContent?.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    test('forwards custom className', () => {
      render(<Pill className="custom-pill">Custom</Pill>);
      const pill = screen.getByText('Custom');
      expect(pill).toHaveClass('custom-pill');
      expect(pill).toHaveClass('ui:inline-flex'); // Should still have base classes
    });

    test('combines multiple props correctly', () => {
      render(
        <Pill shape="square" color="red" tag="HOT" className="custom-class">
          Complex Pill
        </Pill>
      );

      const pill = screen.getByText('Complex Pill');
      expect(pill).toHaveClass('custom-class');
      expect(pill).toHaveClass('ui:rounded-md'); // square shape
      expect(pill).toHaveClass('ui:bg-red-200'); // red color
      expect(screen.getByText('HOT')).toBeInTheDocument(); // tag
    });
  });
});
