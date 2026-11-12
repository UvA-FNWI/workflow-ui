import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('WCAG 1.4.13 content on hover or focus', () => {
    // Note: react-aria's hover/focus-visible detection does not run in jsdom,
    // so opening on real hover/Tab is covered by the Playwright/Storybook checks.
    it('describes the focusable child while open', async () => {
      render(
        <Tooltip content="More info" defaultOpen>
          <button>Trigger</button>
        </Tooltip>
      );

      const tooltip = await screen.findByRole('tooltip');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute(
          'aria-describedby',
          tooltip.id
        )
      );
    });

    it('is dismissible with Escape without moving focus', async () => {
      const user = userEvent.setup();
      render(
        <Tooltip content="More info" defaultOpen>
          <button>Trigger</button>
        </Tooltip>
      );

      const button = screen.getByRole('button', { name: 'Trigger' });
      button.focus();
      await screen.findByRole('tooltip');
      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      );
      expect(button).toHaveFocus();
    });

    it('is hoverable: the popup does not block pointer events', () => {
      render(
        <Tooltip content="More info" defaultOpen>
          <button>Trigger</button>
        </Tooltip>
      );

      expect(screen.getByRole('tooltip').className).not.toContain(
        'pointer-events-none'
      );
    });
  });

  describe('Trigger focusability', () => {
    it('makes a non-focusable trigger focusable and describes it', async () => {
      render(
        <Tooltip content="Explanation" defaultOpen>
          <span>Must be ≥ 5.5</span>
        </Tooltip>
      );

      const tooltip = await screen.findByRole('tooltip');
      const wrapper = screen.getByText('Must be ≥ 5.5').parentElement!;
      expect(wrapper).toHaveAttribute('tabindex', '0');
      expect(wrapper).toHaveAttribute('aria-describedby', tooltip.id);
    });

    it('makes the wrapper focusable when the child button is disabled', () => {
      render(
        <Tooltip content="No changes to save">
          <button disabled>Save</button>
        </Tooltip>
      );

      const wrapper = screen.getByRole('button', {
        name: 'Save',
      }).parentElement!;
      expect(wrapper).toHaveAttribute('tabindex', '0');
    });

    it('does not add a tab stop when the child is focusable', () => {
      render(
        <Tooltip content="Info">
          <button>Trigger</button>
        </Tooltip>
      );

      const wrapper = screen.getByRole('button', {
        name: 'Trigger',
      }).parentElement!;
      expect(wrapper).not.toHaveAttribute('tabindex');
    });
  });
});
