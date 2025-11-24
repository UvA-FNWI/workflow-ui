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
    <div className="ui:w-full ui:p-4">
      <div className="ui:mb-6">
        <Text size="lg" className="ui:mb-4">
          All icons
        </Text>
        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="ui:border-grey-300 ui:w-full ui:rounded-sm ui:border ui:px-4 ui:py-2"
        />
        <Text intent="secondary" size="sm">
          {filteredIcons.length} of {allIcons.length} icons
          {searchTerm && ` matching "${searchTerm}"`}
        </Text>
      </div>
      <div className="ui:bg-grey-200 ui:mb-6 ui:rounded-sm ui:p-4">
        <h4 className="ui:mb-2 ui:font-medium">Usage Tips:</h4>
        <ul className="ui:text-grey-800 ui:space-y-1 ui:text-sm">
          <li>• Click any icon to copy its name to clipboard</li>
          <li>• Use the search bar to filter icons by name</li>
          <li>• Icon names can be used with: {'<Icon name="icon-name" />'}</li>
        </ul>
      </div>
      <div className="ui:grid ui:grid-cols-3 ui:gap-4 ui:rounded-sm md:ui:grid-cols-6 lg:ui:grid-cols-8 xl:ui:grid-cols-10">
        {filteredIcons.map(iconName => (
          <div
            key={iconName}
            className="ui:border-grey-600 ui:group ui:flex ui:cursor-pointer ui:flex-col ui:items-center ui:rounded-lg ui:border ui:p-3 ui:transition-all ui:hover:border-red-300 ui:hover:bg-red-50"
            onClick={() => handleCopyIconName(iconName)}
            title={`Click to copy: ${iconName}`}
          >
            <Icon
              name={iconName}
              size="lg"
              className="ui:group-hover:text-red-brand ui:transition-colors"
            />
            <span className="ui:group-hover:text-red-brand ui:mt-2 ui:w-full ui:truncate ui:text-center ui:text-xs ui:font-medium">
              {iconName.replace(/-/g, ' ')}
            </span>
          </div>
        ))}
      </div>{' '}
      {filteredIcons.length === 0 && (
        <div className="ui:py-12 ui:text-center">
          <Icon
            name="cross-line"
            size="xl"
            className="ui:text-grey-400 ui:mx-auto ui:mb-4"
          />
          <p className="ui:text-grey-600">
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
    <div className="ui:flex ui:items-center ui:gap-4">
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
    <div className="ui:flex ui:items-center ui:gap-4">
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
    <div className="ui:flex ui:items-center ui:gap-4">
      <Icon
        name="alarm-solid"
        className="ui:cursor-pointer ui:text-blue-500 ui:transition-colors ui:hover:text-blue-700"
        size="xl"
      />
      <Icon
        name="accessibility-solid"
        className="ui:rotate-45 ui:transform ui:text-green-500"
        size="xl"
      />
      <Icon
        name="ai-brain-solid"
        className="ui:animate-pulse ui:text-purple-500"
        size="xl"
      />
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="ui:flex ui:flex-col ui:gap-4">
      <div className="ui:flex ui:items-center ui:gap-2">
        <Icon name="accessibility-line" decorative />
        <span>Decorative icon (hidden from screen readers)</span>
      </div>
      <div className="ui:flex ui:items-center ui:gap-2">
        <Icon name="alarm-line" label="Set alarm" />
        <span>Icon with custom accessible label</span>
      </div>
    </div>
  ),
};
