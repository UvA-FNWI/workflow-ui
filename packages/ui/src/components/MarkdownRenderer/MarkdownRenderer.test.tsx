import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('Basic rendering', () => {
    it('renders plain text', () => {
      render(<MarkdownRenderer>Hello world</MarkdownRenderer>);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders markdown bold text', () => {
      render(<MarkdownRenderer>{'**bold text**'}</MarkdownRenderer>);
      const strong = screen.getByText('bold text');
      expect(strong.tagName).toBe('STRONG');
      expect(strong).toHaveClass('font-semibold');
    });

    it('renders unordered list', () => {
      render(<MarkdownRenderer>{'- item one\n- item two'}</MarkdownRenderer>);
      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');
      expect(list).toHaveClass('list-disc', 'pl-5', 'my-1');
      expect(screen.getByText('item one')).toBeInTheDocument();
      expect(screen.getByText('item two')).toBeInTheDocument();
    });

    it('renders ordered list', () => {
      render(<MarkdownRenderer>{'1. first\n2. second'}</MarkdownRenderer>);
      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
      expect(list).toHaveClass('list-decimal', 'pl-5', 'my-1');
    });
  });

  describe('HTML support', () => {
    it('renders <br> tags', () => {
      const { container } = render(
        <MarkdownRenderer>{'line one<br/>line two'}</MarkdownRenderer>
      );
      expect(container.querySelector('br')).toBeInTheDocument();
    });
  });
});
