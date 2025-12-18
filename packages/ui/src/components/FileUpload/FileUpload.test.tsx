import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
  describe('Basic rendering', () => {
    it('renders the upload button', () => {
      render(<FileUpload />);
      expect(screen.getByRole('button')).toHaveTextContent('Upload File');
    });

    it('renders with custom button text', () => {
      render(<FileUpload buttonText="Choose File" />);
      expect(screen.getByRole('button')).toHaveTextContent('Choose File');
    });

    it('renders hidden file input', () => {
      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('ui:hidden');
    });
  });

  describe('File selection', () => {
    it('calls onFileSelect when file is selected', () => {
      const handleFileSelect = vi.fn();
      render(<FileUpload onFileSelect={handleFileSelect} />);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      expect(handleFileSelect).toHaveBeenCalledWith(file);
    });

    it('displays selected file name and size', () => {
      render(<FileUpload showFileName={true} />);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/test\.pdf/)).toBeInTheDocument();
      expect(screen.getByText(/Bytes/)).toBeInTheDocument();
    });

    it('does not display file name when showFileName is false', () => {
      render(<FileUpload showFileName={false} />);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.queryByText(/test\.pdf/)).not.toBeInTheDocument();
    });
  });

  describe('File type validation', () => {
    it('accepts valid file types', () => {
      const handleFileSelect = vi.fn();
      render(
        <FileUpload
          accept={['application/pdf', '.pdf']}
          onFileSelect={handleFileSelect}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(input, { target: { files: [file] } });

      expect(handleFileSelect).toHaveBeenCalledWith(file);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('rejects invalid file types by MIME type', () => {
      const handleFileSelect = vi.fn();
      render(
        <FileUpload
          accept={['application/pdf']}
          onFileSelect={handleFileSelect}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      expect(handleFileSelect).toHaveBeenCalledWith(null);
      expect(screen.getByRole('alert')).toHaveTextContent(
        /File type not accepted/
      );
    });

    it('rejects invalid file types by extension', () => {
      const handleFileSelect = vi.fn();
      render(
        <FileUpload accept={['.pdf', '.doc']} onFileSelect={handleFileSelect} />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      expect(handleFileSelect).toHaveBeenCalledWith(null);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays custom error message for file type', () => {
      render(
        <FileUpload
          accept={['application/pdf']}
          errorMessages={{ fileType: 'Only PDF files are allowed' }}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Only PDF files are allowed'
      );
    });
  });

  describe('File size validation', () => {
    it('accepts files within size limit', () => {
      const handleFileSelect = vi.fn();
      render(
        <FileUpload
          maxSize={1024 * 1024} // 1MB
          onFileSelect={handleFileSelect}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const smallFile = new File(['a'.repeat(100)], 'small.txt', {
        type: 'text/plain',
      });

      fireEvent.change(input, { target: { files: [smallFile] } });

      expect(handleFileSelect).toHaveBeenCalledWith(smallFile);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('rejects files exceeding size limit', () => {
      const handleFileSelect = vi.fn();
      render(
        <FileUpload
          maxSize={100} // 100 bytes
          onFileSelect={handleFileSelect}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const largeFile = new File(['a'.repeat(200)], 'large.txt', {
        type: 'text/plain',
      });

      fireEvent.change(input, { target: { files: [largeFile] } });

      expect(handleFileSelect).toHaveBeenCalledWith(null);
      expect(screen.getByRole('alert')).toHaveTextContent(
        /File size exceeds maximum/
      );
    });

    it('displays custom error message for file size', () => {
      render(
        <FileUpload
          maxSize={100}
          errorMessages={{ fileSize: 'File is too large' }}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const largeFile = new File(['a'.repeat(200)], 'large.txt', {
        type: 'text/plain',
      });

      fireEvent.change(input, { target: { files: [largeFile] } });

      expect(screen.getByRole('alert')).toHaveTextContent('File is too large');
    });
  });

  describe('Disabled state', () => {
    it('disables the button when disabled prop is true', () => {
      render(<FileUpload disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables the file input when disabled prop is true', () => {
      render(<FileUpload disabled={true} />);
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on file input', () => {
      render(<FileUpload />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('aria-label', 'File upload input');
    });

    it('has proper role on error message', () => {
      render(<FileUpload maxSize={10} />);

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      const largeFile = new File(['a'.repeat(100)], 'large.txt', {
        type: 'text/plain',
      });

      fireEvent.change(input, { target: { files: [largeFile] } });

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Button customization', () => {
    it('applies custom button intent', () => {
      render(<FileUpload buttonIntent="primary" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<FileUpload className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
