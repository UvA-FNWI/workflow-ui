import { ListState } from 'react-stately';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ListBox } from './ListBox';
import { ListBoxItem } from './ListBoxItem';

describe('ListBox', () => {
  type SampleItem = { id: string; name: string };

  const sampleItems = [
    { id: '1', name: 'Item One', textValue: 'Item One' },
    { id: '2', name: 'Item Two', textValue: 'Item Two' },
    { id: '3', name: 'Item Three', textValue: 'Item Three' },
  ];

  const renderItems = (state: ListState<SampleItem>) =>
    [...state.collection].map(item => (
      <ListBoxItem key={item.key} item={item} state={state}>
        {(item.value as SampleItem).name}
      </ListBoxItem>
    ));

  describe('Basic rendering', () => {
    it('renders with items', () => {
      render(
        <ListBox items={sampleItems} aria-label="Test listbox">
          {renderItems}
        </ListBox>
      );

      expect(screen.getByText('Item One')).toBeInTheDocument();
      expect(screen.getByText('Item Two')).toBeInTheDocument();
      expect(screen.getByText('Item Three')).toBeInTheDocument();
    });

    it('renders as list element', () => {
      render(
        <ListBox items={sampleItems} aria-label="Test listbox">
          {renderItems}
        </ListBox>
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox.tagName).toBe('UL');
    });

    it('applies custom className', () => {
      render(
        <ListBox
          items={sampleItems}
          aria-label="Test listbox"
          className="custom-class"
        >
          {renderItems}
        </ListBox>
      );

      expect(screen.getByRole('listbox')).toHaveClass('custom-class');
    });
  });

  describe('Selection modes', () => {
    it('supports single selection mode', () => {
      render(
        <ListBox
          items={sampleItems}
          selectionMode="single"
          aria-label="Single select"
        >
          {renderItems}
        </ListBox>
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).not.toHaveAttribute('aria-multiselectable', 'true');
    });

    it('supports multiple selection mode', () => {
      render(
        <ListBox
          items={sampleItems}
          selectionMode="multiple"
          aria-label="Multi select"
        >
          {renderItems}
        </ListBox>
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role', () => {
      render(
        <ListBox items={sampleItems} aria-label="Test listbox">
          {renderItems}
        </ListBox>
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('applies aria-label', () => {
      render(
        <ListBox items={sampleItems} aria-label="Test listbox">
          {renderItems}
        </ListBox>
      );

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Test listbox'
      );
    });
  });
});
