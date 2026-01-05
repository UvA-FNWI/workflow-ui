import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Toast } from './Toast';
import type { ToastContent } from './ToastProvider';

// Mock the useToast hook since it imports i18n
vi.mock('react-aria', () => ({
  useToast: () => ({
    toastProps: { role: 'alert' },
    titleProps: { id: 'toast-title' },
    descriptionProps: { id: 'toast-description' },
  }),
}));

const mockToastContent: ToastContent = {
  type: 'success',
  label: 'Success',
  message: 'Operation completed successfully',
  lifetime: undefined,
};

const createMockToast = (content: ToastContent) => ({
  key: 'test-toast-1',
  content,
  animation: 'entering' as const,
  timer: undefined,
});

describe('Toast', () => {
  it('renders toast with correct content', () => {
    const mockState = {
      close: vi.fn(),
    } as any;

    const toast = createMockToast(mockToastContent);

    render(<Toast toast={toast} state={mockState} />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(
      screen.getByText('Operation completed successfully')
    ).toBeInTheDocument();
  });

  it('renders correct icon for each toast type', () => {
    const mockState = { close: vi.fn() } as any;

    const testCases = [
      { type: 'success' as const, expectedIcon: 'circle-checkmark-line' },
      { type: 'error' as const, expectedIcon: 'triangle-exclamation-line' },
      { type: 'info' as const, expectedIcon: 'square-info-line' },
      { type: 'warning' as const, expectedIcon: 'triangle-exclamation-line' },
      { type: 'note' as const, expectedIcon: 'calendar-edit-line' },
    ];

    testCases.forEach(({ type, expectedIcon }) => {
      const content = { ...mockToastContent, type };
      const toast = createMockToast(content);

      const { container } = render(<Toast toast={toast} state={mockState} />);

      const iconElement = container.querySelector(
        `[data-testid="icon-${expectedIcon}"]`
      );
      expect(iconElement).toBeInTheDocument();
    });
  });

  it('renders action button when actionLabel and onAction are provided', () => {
    const mockOnAction = vi.fn();
    const mockState = { close: vi.fn() } as any;

    const contentWithAction: ToastContent = {
      ...mockToastContent,
      actionLabel: 'Retry',
      onAction: mockOnAction,
    };

    const toast = createMockToast(contentWithAction);

    render(<Toast toast={toast} state={mockState} />);

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('does not render action button when actionLabel or onAction is missing', () => {
    const mockState = { close: vi.fn() } as any;

    const contentWithoutAction: ToastContent = {
      ...mockToastContent,
      actionLabel: undefined,
      onAction: undefined,
    };

    const toast = createMockToast(contentWithoutAction);

    render(<Toast toast={toast} state={mockState} />);

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('renders dismiss button', () => {
    const mockState = { close: vi.fn() } as any;
    const toast = createMockToast(mockToastContent);

    const { container } = render(<Toast toast={toast} state={mockState} />);

    const dismissButton = container.querySelector(
      '[data-testid="icon-cross-line"]'
    );
    expect(dismissButton).toBeInTheDocument();
  });

  it('applies correct CSS classes for toast type', () => {
    const mockState = { close: vi.fn() } as any;
    const toast = createMockToast(mockToastContent);

    const { container } = render(<Toast toast={toast} state={mockState} />);

    const toastElement = container.firstChild as HTMLElement;
    expect(toastElement.className).toContain('ui:bg-forest-200');
    expect(toastElement.className).toContain('ui:before:bg-forest-800');
  });
});
