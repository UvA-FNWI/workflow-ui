import { useRef, useState } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Link } from '../Link/Link';

const fileUploadClassGenerator = cva('ui:inline-flex ui:flex-col ui:gap-2');

const errorClassGenerator = cva(
  'ui:text-sm ui:text-red-600 ui:dark:text-red-400'
);

const fileInfoClassGenerator = cva(
  'ui:text-sm ui:text-grey-700 ui:dark:text-grey-300'
);

export interface FileUploadProps {
  /** Accepted file types (e.g., ['image/png', 'application/pdf', '.jpg']) */
  accept?: string[];
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Callback when file is selected */
  onFileSelect?: (file: File | null) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Button text */
  buttonText?: string;
  /** Button intent */
  buttonIntent?:
    | 'primary'
    | 'secondary'
    | 'destructivePrimary'
    | 'destructiveSecondary'
    | 'ghost';
  /** Show selected file name */
  showFileName?: boolean;
  /** External file name to display (e.g., from backend) */
  fileName?: string;
  /** Custom error messages */
  errorMessages?: {
    fileType?: string;
    fileSize?: string;
  };
  /** Whether the upload is in progress */
  isLoading?: boolean;
  /** Callback when file name is clicked */
  onFileNameClick?: () => void;
}

export const FileUpload = ({
  accept = [],
  maxSize,
  onFileSelect,
  disabled = false,
  className,
  buttonText = 'Upload File',
  buttonIntent = 'secondary',
  showFileName = true,
  fileName,
  errorMessages = {},
  isLoading = false,
  onFileNameClick,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    onFileSelect?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (accept.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type;

      const isAccepted = accept.some(acceptType => {
        // Handle MIME types (e.g., 'image/png')
        if (acceptType.includes('/')) {
          return fileType === acceptType;
        }
        // Handle extensions (e.g., '.pdf')
        return fileExtension === acceptType.toLowerCase();
      });

      if (!isAccepted) {
        return (
          errorMessages.fileType ||
          `File type not accepted. Accepted types: ${accept.join(', ')}`
        );
      }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      return (
        errorMessages.fileSize ||
        `File size exceeds maximum of ${formatFileSize(maxSize)}`
      );
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError(null);

    if (file) {
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        onFileSelect?.(null);
        // Reset input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      setSelectedFile(file);
      onFileSelect?.(file);
    } else {
      setSelectedFile(null);
      onFileSelect?.(null);
    }
  };

  // Build accept attribute for input
  const acceptAttribute = accept.length > 0 ? accept.join(',') : undefined;

  return (
    <div className={cn(fileUploadClassGenerator(), className)}>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        accept={acceptAttribute}
        disabled={disabled}
        className="ui:hidden"
        aria-label="File upload input"
      />

      {!(selectedFile || fileName) && (
        <Button
          intent={buttonIntent}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          leftIcon={<Icon name="upload-line" size="sm" color="current" />}
          isLoading={isLoading}
        >
          {buttonText}
        </Button>
      )}

      {showFileName && (selectedFile || fileName) && !error && (
        <div
          className={cn(
            'ui:flex ui:items-center ui:justify-between',
            fileInfoClassGenerator()
          )}
        >
          <div>
            {selectedFile ? (
              <>
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </>
            ) : onFileNameClick ? (
              <Link intent="primary" underline onClick={onFileNameClick}>
                {fileName}
              </Link>
            ) : (
              fileName
            )}
          </div>
          {(selectedFile || fileName) && (
            <Button
              intent="ghost"
              disabled={disabled}
              onClick={handleRemoveFile}
              leftIcon={<Icon name="trash-line" size="sm" color="current" />}
              aria-label="Remove file"
              className="ui:ml-1"
            />
          )}
        </div>
      )}

      {error && (
        <div className={errorClassGenerator()} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
