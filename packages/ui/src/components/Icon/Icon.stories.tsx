import { useEffect, useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text/Text';
import { Icon } from './Icon';
import { getIconNames as getAvailableIcons } from './spriteData';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: { type: 'text' },
      description: 'The name of the icon to display',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'The size of the icon',
    },
    color: {
      control: { type: 'select' },
      options: [
        'default',
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
      ],
      description: 'The color variant of the icon',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    name: 'accessibility-line',
    size: 'md',
    color: 'primary',
  },
};

const IconBrowserComponent = () => {
  const [allIcons, setAllIcons] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadIcons = async () => {
      const icons = await getAvailableIcons();
      setAllIcons(icons);
    };

    loadIcons();
  }, []);

  const filteredIcons = useMemo(() => {
    if (searchTerm.trim() === '') {
      // Show all icons when no search term
      return allIcons;
    }
    return allIcons.filter(icon =>
      icon.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allIcons, searchTerm]);

  const handleCopyIconName = (iconName: string) => {
    navigator.clipboard.writeText(iconName);
  };

  return (
    <div className="w-full p-4">
      <div className="mb-6">
        <Text size="lg" className="mb-4">
          All icons
        </Text>
        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-grey-300 rounded-sm"
        />
        <Text intent="secondary" size="sm">
          {filteredIcons.length} of {allIcons.length} icons
          {searchTerm && ` matching "${searchTerm}"`}
        </Text>
      </div>
      <div className="mb-6 p-4 bg-grey-200 rounded-sm">
        <h4 className="font-medium mb-2">Usage Tips:</h4>
        <ul className="text-sm text-grey-800 space-y-1">
          <li>• Click any icon to copy its name to clipboard</li>
          <li>• Use the search bar to filter icons by name</li>
          <li>• Icon names can be used with: {'<Icon name="icon-name" />'}</li>
        </ul>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 rounded-sm">
        {filteredIcons.map(iconName => (
          <div
            key={iconName}
            className="flex flex-col items-center p-3 rounded-lg border border-grey-600 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer group"
            onClick={() => handleCopyIconName(iconName)}
            title={`Click to copy: ${iconName}`}
          >
            <Icon
              name={iconName}
              size="lg"
              className=" group-hover:text-red-brand transition-colors"
            />
            <span className="text-xs text-center mt-2 group-hover:text-red-brand font-medium truncate w-full">
              {iconName.replace(/-/g, ' ')}
            </span>
          </div>
        ))}
      </div>{' '}
      {filteredIcons.length === 0 && (
        <div className="text-center py-12">
          <Icon
            name="cross-line"
            size="xl"
            className="text-grey-400 mx-auto mb-4"
          />
          <p className="text-grey-600">
            No icons found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export const All: Story = {
  render: () => <IconBrowserComponent />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="accessibility-line" size="xs" />
      <Icon name="accessibility-line" size="sm" />
      <Icon name="accessibility-line" size="md" />
      <Icon name="accessibility-line" size="lg" />
      <Icon name="accessibility-line" size="xl" />
      <Icon name="accessibility-line" size="2xl" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="alarm-line" color="primary" />
      <Icon name="alarm-line" color="secondary" />
      <Icon name="alarm-line" color="success" />
      <Icon name="alarm-line" color="warning" />
      <Icon name="alarm-line" color="danger" />
      <Icon name="alarm-line" color="info" />
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon
        name="alarm-solid"
        className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
        size="xl"
      />
      <Icon
        name="accessibility-solid"
        className="text-green-500 rotate-45 transform"
        size="xl"
      />
      <Icon
        name="ai-brain-solid"
        className="text-purple-500 animate-pulse"
        size="xl"
      />
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon name="accessibility-line" decorative />
        <span>Decorative icon (hidden from screen readers)</span>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="alarm-line" label="Set alarm" />
        <span>Icon with custom accessible label</span>
      </div>
    </div>
  ),
};
