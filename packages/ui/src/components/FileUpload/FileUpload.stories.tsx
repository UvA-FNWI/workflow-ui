import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { FileUpload } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  args: {},
};

export const WithCustomButtonText: Story = {
  args: {
    buttonText: 'Choose File',
  },
};

export const WithFileTypeValidation: Story = {
  args: {
    accept: ['application/pdf', '.pdf'],
    buttonText: 'Upload PDF',
  },
};

export const WithImageValidation: Story = {
  args: {
    accept: ['image/png', 'image/jpeg', '.png', '.jpg', '.jpeg'],
    buttonText: 'Upload Image',
  },
};

export const WithSizeLimit: Story = {
  args: {
    maxSize: 1024 * 1024 * 5, // 5MB
    buttonText: 'Upload File (Max 5MB)',
  },
};

export const WithMultipleValidations: Story = {
  args: {
    accept: ['application/pdf', '.pdf'],
    maxSize: 1024 * 1024 * 2, // 2MB
    buttonText: 'Upload PDF (Max 2MB)',
  },
};

export const WithCustomErrorMessages: Story = {
  args: {
    accept: ['application/pdf'],
    maxSize: 1024 * 1024,
    errorMessages: {
      fileType: 'Please upload a PDF file only.',
      fileSize: 'File must be smaller than 1MB.',
    },
    buttonText: 'Upload PDF',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    buttonText: 'Upload Disabled',
  },
};

export const WithRemoveButton: Story = {
  args: {
    allowRemove: true,
    buttonText: 'Upload File',
    showFileName: true,
  },
};

export const WithFileName: Story = {
  args: {
    showFileName: true,
    buttonText: 'Upload File',
  },
};

export const PrimaryIntent: Story = {
  args: {
    buttonIntent: 'primary',
    buttonText: 'Upload Now',
  },
};

export const SecondaryIntent: Story = {
  args: {
    buttonIntent: 'secondary',
    buttonText: 'Choose File',
  },
};

export const WithClickableFileName: Story = {
  render: function Render(args) {
    const [clickCount, setClickCount] = useState(0);

    const handleFileNameClick = () => {
      setClickCount(prev => prev + 1);
      alert('File clicked! This would open the file in a new tab.');
    };

    return (
      <div className="ui:flex ui:flex-col ui:gap-4 ui:w-96">
        <FileUpload
          {...args}
          onFileNameClick={handleFileNameClick}
          fileName="document.pdf"
          showFileName
        />
        <div className="ui:p-4 ui:bg-gray-100 ui:rounded-md">
          <p className="ui:text-sm ui:font-medium">Info:</p>
          <p className="ui:text-sm">File name clicked {clickCount} time(s)</p>
          <p className="ui:text-xs ui:text-gray-600 ui:mt-2">
            Click the file name above to test the functionality
          </p>
        </div>
      </div>
    );
  },
  args: {
    buttonText: 'Upload File',
  },
};

export const Interactive: Story = {
  render: function Render(args) {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('No file selected');

    const handleFileSelect = (selectedFile: File | null) => {
      setFile(selectedFile);
      if (selectedFile) {
        setStatus(
          `Selected: ${selectedFile.name} (${selectedFile.size} bytes)`
        );
      } else {
        setStatus('No file selected');
      }
    };

    return (
      <div className="ui:flex ui:flex-col ui:gap-4 ui:w-96">
        <FileUpload {...args} onFileSelect={handleFileSelect} showFileName />
        <div className="ui:p-4 ui:bg-gray-100 ui:rounded-md">
          <p className="ui:text-sm ui:font-medium">Status:</p>
          <p className="ui:text-sm">{status}</p>
          {file && (
            <>
              <p className="ui:text-sm ui:font-medium ui:mt-2">File Details:</p>
              <ul className="ui:text-sm ui:list-disc ui:list-inside">
                <li>Name: {file.name}</li>
                <li>Type: {file.type}</li>
                <li>Size: {file.size} bytes</li>
              </ul>
            </>
          )}
        </div>
      </div>
    );
  },
  args: {
    accept: [
      'application/pdf',
      'image/png',
      'image/jpeg',
      '.pdf',
      '.png',
      '.jpg',
    ],
    maxSize: 1024 * 1024 * 10, // 10MB
    buttonText: 'Upload File',
    allowRemove: true,
  },
};
