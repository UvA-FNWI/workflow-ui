import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../Button/Button';
import { Menu } from './Menu';
import { resolveTextValue } from './menuUtils';

vi.mock('../Icon', () => ({
  Icon: ({
    name,
    size,
    decorative,
    className,
  }: {
    name: string;
    size: string;
    decorative?: boolean;
    className?: string;
  }) => (
    <span
      data-icon={name}
      data-size={size}
      aria-hidden={decorative || undefined}
      className={className}
    />
  ),
}));

describe('Menu', () => {
  it('infers textValue from string content and requires it for rich content', () => {
    expect(resolveTextValue({ id: 'profile', content: 'Profile' })).toBe(
      'Profile'
    );
    expect(() =>
      resolveTextValue({ id: 'profile', content: <strong>Profile</strong> })
    ).toThrow('must provide textValue');
  });

  it('renders named icons and custom React nodes as leading icons', () => {
    render(
      <Menu
        ariaLabel="User menu"
        trigger={({ triggerProps, triggerRef }) => (
          <Button {...triggerProps} ref={triggerRef} intent="ghost">
            User menu
          </Button>
        )}
        items={[
          {
            id: 'profile',
            icon: 'user-line',
            content: 'Profile',
          },
          {
            id: 'language',
            icon: <span data-testid="language-flag">🇬🇧</span>,
            content: 'Language',
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'User menu' }));

    const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
    const namedIcon = profileItem.querySelector('[data-icon="user-line"]');
    const languageFlag = screen.getByTestId('language-flag');
    const languageItem = languageFlag.closest('[role="menuitem"]');

    expect(profileItem).toHaveClass('ui:cursor-pointer');
    expect(namedIcon).toHaveAttribute('data-size', 'lg');
    expect(namedIcon).toHaveAttribute('aria-hidden', 'true');
    expect(languageItem).toContainElement(languageFlag);
    expect(languageFlag.parentElement).toHaveClass(
      'ui:h-6',
      'ui:w-6',
      'ui:shrink-0',
      'ui:items-center',
      'ui:justify-center'
    );
  });

  it('adds a larger right chevron only to items that open a submenu', () => {
    render(
      <Menu
        ariaLabel="Preferences"
        trigger={({ triggerProps, triggerRef }) => (
          <Button {...triggerProps} ref={triggerRef} intent="ghost">
            Preferences
          </Button>
        )}
        items={[
          {
            id: 'profile',
            content: 'Profile',
          },
          {
            id: 'language',
            content: 'Language',
            submenu: {
              ariaLabel: 'Language',
              items: [
                {
                  id: 'en',
                  content: 'English',
                },
              ],
            },
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }));

    const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
    const languageItem = screen.getByRole('menuitem', { name: 'Language' });
    const chevron = languageItem.querySelector(
      '[data-icon="chevron-right-line"]'
    );

    expect(profileItem.querySelector('[data-icon]')).not.toBeInTheDocument();
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(chevron).toHaveAttribute('data-size', 'md');
    expect(chevron).toHaveClass('ui:ml-auto', 'ui:shrink-0');
  });
});
