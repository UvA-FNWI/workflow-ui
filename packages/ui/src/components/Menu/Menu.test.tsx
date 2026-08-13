import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../Button/Button';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';
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
  it('infers textValue from a string label and requires it for a rich label', () => {
    expect(resolveTextValue({ id: 'profile', label: 'Profile' })).toBe(
      'Profile'
    );
    expect(() =>
      resolveTextValue({ id: 'profile', label: <strong>Profile</strong> })
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
      >
        <MenuItem id="profile" icon="user-line" label="Profile" />
        <MenuItem
          id="language"
          icon={<span data-testid="language-flag">🇬🇧</span>}
          label="Language"
        />
      </Menu>
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

  it('renders selected state as part of MenuItem', () => {
    render(
      <Menu
        ariaLabel="Languages"
        selectionMode="single"
        selectedKeys={['en']}
        trigger={({ triggerProps, triggerRef }) => (
          <Button {...triggerProps} ref={triggerRef} intent="ghost">
            Languages
          </Button>
        )}
      >
        <MenuItem id="en" label="English" />
        <MenuItem id="nl" label="Dutch" />
      </Menu>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Languages' }));

    expect(
      screen
        .getByRole('menuitemradio', { name: 'English' })
        .querySelector('[data-icon="checkmark-solid"]')
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('menuitemradio', { name: 'Dutch' })
        .querySelector('[data-icon="checkmark-solid"]')
    ).not.toBeInTheDocument();
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
      >
        <MenuItem id="profile" label="Profile" />
        <MenuItem id="language" label="Language">
          <MenuItem key="en" id="en" label="English" />
          <MenuItem key="nl" id="nl" label="Dutch" />
        </MenuItem>
      </Menu>
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

  it('uses Menu recursively for nested menus', () => {
    render(
      <Menu
        ariaLabel="Preferences"
        trigger={({ triggerProps, triggerRef }) => (
          <Button {...triggerProps} ref={triggerRef} intent="ghost">
            Preferences
          </Button>
        )}
      >
        <MenuItem id="profile" label="Profile" />
        <MenuItem id="language" label="Language">
          <MenuItem key="european" id="european" label="European">
            <MenuItem key="en" id="en" label="English" />
            <MenuItem key="nl" id="nl" label="Dutch" />
          </MenuItem>
          <MenuItem key="other" id="other" label="Other" />
        </MenuItem>
      </Menu>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }));
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Language' }), {
      key: 'ArrowRight',
    });
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'European' }), {
      key: 'ArrowRight',
    });

    expect(screen.getByRole('menu', { name: 'Language' })).toBeVisible();
    expect(screen.getByRole('menu', { name: 'European' })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'English' })).toBeVisible();
  });
});
