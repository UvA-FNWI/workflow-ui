import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
  describe('Basic rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Header>Test Modal</Modal.Header>
          <Modal.Body>Modal content</Modal.Body>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(
        <Modal isOpen={false} onOpenChange={vi.fn()}>
          <Modal.Header>Test Modal</Modal.Header>
          <Modal.Body>Modal content</Modal.Body>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders nothing when isOpen is not provided', () => {
      const { container } = render(
        <Modal onOpenChange={vi.fn()}>
          <Modal.Header>Test Modal</Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Compound components', () => {
    it('renders Modal.Header correctly', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Header>Custom Title</Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Custom Title');
    });

    it('renders Modal.Body correctly', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Body>Body content goes here</Modal.Body>
        </Modal>
      );

      expect(screen.getByText('Body content goes here')).toBeInTheDocument();
    });

    it('renders Modal.Footer correctly', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
          <Modal.Footer>
            <button>Footer Button</button>
          </Modal.Footer>
        </Modal>
      );

      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('renders all compound components together', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Header>Header</Modal.Header>
          <Modal.Body>Body</Modal.Body>
          <Modal.Footer>Footer</Modal.Footer>
        </Modal>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('allows custom className on Modal.Header', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Header className="custom-header">Title</Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const header = screen.getByRole('heading').parentElement;
      expect(header).toHaveClass('custom-header');
    });

    it('allows custom className on Modal.Body', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Body className="custom-body">Content</Modal.Body>
        </Modal>
      );

      const body = screen.getByText('Content');
      expect(body).toHaveClass('custom-body');
    });

    it('allows custom className on Modal.Footer', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
          <Modal.Footer className="custom-footer">Footer</Modal.Footer>
        </Modal>
      );

      const footer = screen.getByText('Footer').closest('footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Close button', () => {
    it('renders close button by default when Modal.Header is present', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Header>Title</Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('does not render close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} showCloseButton={false}>
          <Modal.Header>Title</Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('calls onOpenChange when close button is clicked', () => {
      const handleOpenChange = vi.fn();

      render(
        <Modal isOpen={true} onOpenChange={handleOpenChange}>
          <Modal.Header>Title</Modal.Header>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not render close button when there is no Modal.Header', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Body>Content without header</Modal.Body>
        </Modal>
      );

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('applies small size classes', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} size="sm">
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-md');
    });

    it('applies medium size classes (default)', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-lg');
    });

    it('applies large size classes', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} size="lg">
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-2xl');
    });

    it('applies xl size classes', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} size="xl">
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-4xl');
    });

    it('applies full size classes', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} size="full">
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const dialogContent = screen.getByRole('dialog').firstElementChild;
      expect(dialogContent).toHaveClass('ui:max-w-[95vw]');
    });
  });

  describe('Role variants', () => {
    it('applies dialog role by default', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()}>
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('applies alertdialog role when specified', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} role="alertdialog">
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  describe('Custom classes', () => {
    it('forwards custom className to overlay', () => {
      render(
        <Modal isOpen={true} onOpenChange={vi.fn()} className="custom-class">
          <Modal.Body>Content</Modal.Body>
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
          <Modal.Body>Content</Modal.Body>
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
          <Modal.Body>Content</Modal.Body>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });

      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });
});
