import { useState } from 'react';

import { Overlay } from 'react-aria';

import type { Meta, StoryObj } from '@storybook/react';

import { Item, Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Select>;

const BasicSelect = (args: any) => (
  <div className="max-w-sm">
    <Select {...args}>
      <Item key="draft">Draft</Item>
      <Item key="review">In review</Item>
      <Item key="approved">Approved</Item>
      <Item key="published">Published</Item>
    </Select>
  </div>
);

export const Basic: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    placeholder: 'Select status',
  },
};

export const Disabled: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    defaultSelectedKey: 'review',
    isDisabled: true,
  },
};

const ControlledSelect = () => {
  const [value, setValue] = useState<string | null>('draft');

  return (
    <div className="max-w-sm space-y-4">
      <Select
        label="Status"
        onChange={key => setValue((key as string | null) ?? null)}
      >
        <Item key="draft">Draft</Item>
        <Item key="review">In review</Item>
        <Item key="approved">Approved</Item>
        <Item key="published">Published</Item>
      </Select>
      <div className="text-sm">
        <strong>Selected:</strong> {value ?? 'None'}
      </div>
    </div>
  );
};

export const Controlled: Story = {
  render: ControlledSelect,
};

export const WithDescriptionAndError: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    description: 'Pick the current workflow status.',
    errorMessage: 'Status is required',
    isValid: false,
  },
};

export const Multiple: Story = {
  render: BasicSelect,
  args: {
    label: 'Status',
    selectionMode: 'multiple',
  },
};

export const Number: Story = {
  render: (args: any) => (
    <Select {...args} className="ui:w-24 ui:items-center">
      {Array.from({ length: 11 }, (_, i) => (
        <Item key={i}>{i}</Item>
      ))}
    </Select>
  ),
  args: {
    label: 'Number',
    placeholder: '0-10',
  },
};

type PopoverItem = {
  label: string;
  options: { key: string; display: string }[];
};

const popoverItems: PopoverItem[] = [
  {
    label: 'Fruits',
    options: [
      { key: 'apple', display: 'Apple' },
      { key: 'banana', display: 'Banana' },
    ],
  },
  {
    label: 'Veggies',
    options: [
      { key: 'carrot', display: 'Carrot' },
      { key: 'broccoli', display: 'Broccoli' },
    ],
  },
  {
    label: 'Grains',
    options: [
      { key: 'rice', display: 'Rice' },
      { key: 'oats', display: 'Oats' },
    ],
  },
];

const CustomPopoverSelect = (args: any) => {
  const [value, setValue] = useState<string>('');

  return (
    <div className="max-w-sm">
      <Select
        {...args}
        value={value}
        customPopover={({ state, triggerRef: _triggerRef, menuProps }) => {
          const {
            role,
            id,
            'aria-labelledby': ariaLabelledBy,
          } = menuProps as any;

          return (
            <Overlay>
              <div
                style={{
                  position: 'absolute',
                  ...(state.isOpen ? {} : { display: 'none' }),
                }}
                className="ui:max-h-80 ui:overflow-y-auto ui:rounded ui:border ui:border-grey-300 ui:bg-white ui:shadow-xl ui:outline-none"
              >
                <ul
                  role={role}
                  id={id}
                  aria-labelledby={ariaLabelledBy}
                  className="ui:m-0 ui:list-none ui:p-0"
                >
                  {popoverItems.map((item, index) => (
                    <li
                      key={item.label}
                      className={`ui:flex ui:items-stretch ${index < popoverItems.length - 1 ? 'ui:border-b ui:border-grey-300' : ''}`}
                    >
                      <div className="ui:flex-1 ui:px-4 ui:py-3 ui:text-sm">
                        {item.label}
                      </div>

                      <div className="ui:flex ui:w-32 ui:flex-col ui:border-l ui:border-grey-300">
                        {item.options.map(option => (
                          <button
                            key={option.key}
                            type="button"
                            onMouseDown={() => {
                              setValue(option.key);
                              state.close();
                            }}
                            className={`ui:flex ui:flex-1 ui:items-center ui:justify-center ui:border-b ui:border-grey-200 ui:px-4 ui:text-sm ${value === option.key ? 'ui:bg-grey-300' : 'ui:hover:bg-grey-200'}`}
                          >
                            {option.display}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Overlay>
          );
        }}
      >
        {popoverItems.flatMap(item =>
          item.options.map(option => (
            <Item key={option.key}>{option.display}</Item>
          ))
        )}
      </Select>
      <div className="ui:mt-2 ui:text-sm">
        <strong>Selected:</strong> {value || 'None'}
      </div>
    </div>
  );
};

export const WithCustomPopover: Story = {
  render: CustomPopoverSelect,
  args: {
    label: 'Status',
    placeholder: 'Select status',
  },
};
