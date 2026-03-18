import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  describe('Rendering', () => {
    it('renders the trigger element', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(
        screen.getByRole('button', { name: 'Hover me' })
      ).toBeInTheDocument();
    });

    it('does not show tooltip content by default', () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });
  });

  describe('Visibility', () => {
    it('shows tooltip when defaultOpen is true', () => {
      render(
        <Tooltip content="Tooltip text" defaultOpen>
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    it('shows tooltip when controlled isOpen is true', () => {
      render(
        <Tooltip content="Tooltip text" isOpen>
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('hides tooltip when controlled isOpen is false', () => {
      render(
        <Tooltip content="Tooltip text" isOpen={false}>
          <button>Hover me</button>
        </Tooltip>
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('renders string content', () => {
      render(
        <Tooltip content="Simple text" defaultOpen>
          <button>Trigger</button>
        </Tooltip>
      );

      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('renders JSX content', () => {
      render(
        <Tooltip
          content={<span data-testid="custom-content">Rich content</span>}
          defaultOpen
        >
          <button>Trigger</button>
        </Tooltip>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Rich content')).toBeInTheDocument();
    });
  });

  describe('Custom attributes', () => {
    it('applies custom className to the tooltip popup', () => {
      render(
        <Tooltip content="Tooltip text" className="custom-class" defaultOpen>
          <button>Trigger</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip')).toHaveClass('custom-class');
    });
  });

  describe('Controlled state', () => {
    it('renders without tooltip when isDisabled is set', () => {
      render(
        <Tooltip content="Tooltip text" isDisabled>
          <button>Trigger</button>
        </Tooltip>
      );

      expect(
        screen.getByRole('button', { name: 'Trigger' })
      ).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});
