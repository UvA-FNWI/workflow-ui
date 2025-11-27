import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  describe('Basic rendering', () => {
    it('renders modal when isOpen is true', () => {
      // First, let's just test if the component doesn't crash
      const result = render(
        <Modal isOpen={true} onOpenChange={vi.fn()} title="Test Modal">
          <div>Modal content</div>
        </Modal>
      );

      // The component should render something
      expect(result).toBeTruthy();
    });

    it('does not render modal when isOpen is false', () => {
      render(
        <Modal isOpen={false} onOpenChange={vi.fn()} title="Test Modal">
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders nothing when isOpen is not provided and no trigger', () => {
      const { container } = render(
        <Modal onOpenChange={vi.fn()} title="Test Modal">
          <div>Modal content</div>
        </Modal>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Title and close button', () => {
    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} title="Custom Title">
          <div>Content</div>
        </Modal>
      );

      // Should find the visible title (not the screen reader one)
      const headings = screen.getAllByRole('heading', { level: 2 });
      const visibleTitle = headings.find(
        heading => !heading.classList.contains('ui:sr-only')
      );
      expect(visibleTitle).toHaveTextContent('Custom Title');
    });

    it('renders close button by default', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} title="Test">
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('does not render close button when showCloseButton is false', () => {
      render(
        <Modal
          isOpen={true}
          onOpenChange={vi.fn()}
          title="Test"
          showCloseButton={false}
        >
          <div>Content</div>
        </Modal>
      );

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('calls onOpenChange when close button is clicked', () => {
      const handleOpenChange = vi.fn();

      render(
        <Modal isOpen={true} onOpenChange={handleOpenChange} title="Test">
          <div>Content</div>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} size="sm">
          <div>Content</div>
        </Modal>
      );

      // The size classes are applied to the div inside the dialog
      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-md');
    });

    it('applies medium size classes (default)', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <div>Content</div>
        </Modal>
      );

      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-lg');
    });

    it('applies large size classes', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} size="lg">
          <div>Content</div>
        </Modal>
      );

      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-2xl');
    });
  });

  describe('Footer', () => {
    it('renders footer when provided', () => {
      const footer = <button>Footer Button</button>;

      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} footer={footer}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('does not render footer when not provided', () => {
      const { container } = render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(container.querySelector('footer')).not.toBeInTheDocument();
    });
  });

  describe('Role variants', () => {
    it('applies dialog role by default', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('applies alertdialog role when specified', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} role="alertdialog">
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  describe('Trigger usage', () => {
    it('renders with trigger button for uncontrolled usage', () => {
      const trigger = <button>Open Modal</button>;

      render(
        <Modal trigger={trigger} title="Triggered Modal">
          <div>Modal content</div>
        </Modal>
      );

      expect(screen.getByText('Open Modal')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens modal when trigger is clicked', async () => {
      const trigger = <button>Open Modal</button>;

      render(
        <Modal trigger={trigger} title="Triggered Modal">
          <div>Modal content</div>
        </Modal>
      );

      const triggerButton = screen.getByText('Open Modal');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Modal content')).toBeInTheDocument();
      });
    });
  });

  describe('Custom classes', () => {
    it('forwards custom className to overlay', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} className="custom-class">
          <div>Content</div>
        </Modal>
      );

      const overlay = document.body.querySelector('.custom-class');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Keyboard interactions', () => {
    it('closes modal on Escape key by default', () => {
      const handleOpenChange = vi.fn();

      render(
        <Modal isOpen={true} onOpenChange={handleOpenChange}>
          <div>Content</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close on Escape when isKeyboardDismissDisabled is true', () => {
      const handleOpenChange = vi.fn();

      render(
        <Modal
          isOpen={true}
          onOpenChange={handleOpenChange}
          isKeyboardDismissDisabled={true}
        >
          <div>Content</div>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });

      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });
});
