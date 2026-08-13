import { ReactElement, useRef } from 'react';

import { AriaMenuOptions, FocusScope, useMenu } from 'react-aria';
import { Item, RootMenuTriggerState, useTreeState } from 'react-stately';

import { MenuProvider } from '../../hooks/useMenuContext';
import type { MenuDefinition } from './Menu';
import type { MenuItemProps } from './MenuItem';
import { resolveTextValue } from './menuUtils';

interface MenuListProps extends MenuDefinition {
  rootState: RootMenuTriggerState;
  ariaProps?: AriaMenuOptions<MenuItemProps>;
  menuRef?: React.RefObject<HTMLUListElement | null>;
}

export function MenuList({
  ariaLabel,
  children,
  selectionMode = 'none',
  selectedKeys,
  rootState,
  ariaProps,
  menuRef: suppliedMenuRef,
}: MenuListProps) {
  const fallbackMenuRef = useRef<HTMLUListElement>(null);
  const menuRef = suppliedMenuRef ?? fallbackMenuRef;
  const menuItems = (Array.isArray(children) ? children : [children]).filter(
    (child): child is ReactElement<MenuItemProps> => Boolean(child)
  );
  const state = useTreeState<MenuItemProps>({
    items: menuItems.map(child => child.props),
    children: item => {
      const textValue = resolveTextValue(item);
      return (
        <Item key={item.id} textValue={textValue}>
          {textValue}
        </Item>
      );
    },
    selectionMode,
    selectedKeys,
    disabledKeys: menuItems
      .filter(child => child.props.isDisabled)
      .map(child => child.props.id),
  });
  const { menuProps } = useMenu(
    {
      ...ariaProps,
      'aria-label': ariaLabel,
      shouldFocusWrap: true,
    },
    state,
    menuRef
  );

  return (
    <FocusScope>
      <MenuProvider state={state} menuRef={menuRef} rootState={rootState}>
        <ul {...menuProps} ref={menuRef} className="ui:outline-none">
          {menuItems}
        </ul>
      </MenuProvider>
    </FocusScope>
  );
}
