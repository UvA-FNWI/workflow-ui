import { useEffect, useMemo, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Text/Text';
import { Icon } from './Icon';
import { IconType } from './IconTypes';
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
  }, [allIcons, searchTerm]) as IconType[];

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
          className="border-grey-300 w-full rounded-sm border px-4 py-2"
        />
        <Text intent="secondary" size="sm">
          {filteredIcons.length} of {allIcons.length} icons
          {searchTerm && ` matching "${searchTerm}"`}
        </Text>
      </div>
      <div className="bg-grey-200 mb-6 rounded-sm p-4">
        <h4 className="mb-2 font-medium">Usage Tips:</h4>
        <ul className="text-grey-800 space-y-1 text-sm">
          <li>• Click any icon to copy its name to clipboard</li>
          <li>• Use the search bar to filter icons by name</li>
          <li>• Icon names can be used with: {'<Icon name="icon-name" />'}</li>
        </ul>
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-sm md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {filteredIcons.map(iconName => (
          <div
            key={iconName}
            className="border-grey-600 group flex cursor-pointer flex-col items-center rounded-lg border p-3 transition-all hover:border-red-300 hover:bg-red-50"
            onClick={() => handleCopyIconName(iconName)}
            title={`Click to copy: ${iconName}`}
          >
            <Icon
              name={iconName}
              size="lg"
              className="group-hover:text-red-brand transition-colors"
            />
            <span className="group-hover:text-red-brand mt-2 w-full truncate text-center text-xs font-medium">
              {iconName.replace(/-/g, ' ')}
            </span>
          </div>
        ))}
      </div>{' '}
      {filteredIcons.length === 0 && (
        <div className="py-12 text-center">
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
        className="cursor-pointer text-blue-500 transition-colors hover:text-blue-700"
        size="xl"
      />
      <Icon
        name="accessibility-solid"
        className="rotate-45 transform text-green-500"
        size="xl"
      />
      <Icon
        name="ai-brain-solid"
        className="animate-pulse text-purple-500"
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
