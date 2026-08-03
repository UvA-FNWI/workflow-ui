import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './Input';

describe('Input', () => {
  describe('Basic rendering', () => {
    it('renders an input with a label', () => {
      render(<Input label="Name" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('applies lg size styles by default', () => {
      render(<Input aria-label="Field" />);
      expect(screen.getByRole('textbox')).toHaveClass(
        'ui:min-h-10',
        'ui:px-3',
        'ui:py-2',
        'ui:text-base'
      );
    });

    it('applies md size styles', () => {
      render(<Input aria-label="Field" size="md" />);
      expect(screen.getByRole('textbox')).toHaveClass(
        'ui:min-h-8',
        'ui:px-3',
        'ui:py-1.5',
        'ui:text-sm'
      );
    });

    it('applies sm size styles', () => {
      render(<Input aria-label="Field" size="sm" />);
      expect(screen.getByRole('textbox')).toHaveClass(
        'ui:min-h-6',
        'ui:px-2',
        'ui:py-1',
        'ui:text-xs'
      );
    });
  });

  describe('Align variants', () => {
    it('aligns text left by default', () => {
      render(<Input aria-label="Field" />);
      expect(screen.getByRole('textbox')).toHaveClass('ui:text-left');
    });

    it('aligns text center when align="center"', () => {
      render(<Input aria-label="Field" align="center" />);
      expect(screen.getByRole('textbox')).toHaveClass('ui:text-center');
    });
  });
});
