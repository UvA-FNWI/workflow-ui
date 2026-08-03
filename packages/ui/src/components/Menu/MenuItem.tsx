import { useRef } from 'react';

import {
  AriaMenuOptions,
  FocusScope,
  mergeProps,
  useHover,
  useMenu,
  useMenuItem,
  useSubmenuTrigger,
} from 'react-aria';
import {
  Item,
  Node,
  RootMenuTriggerState,
  TreeState,
  useSubmenuTriggerState,
  useTreeState,
} from 'react-stately';

import { cn } from '../../utils/cn';
import { Popover } from '../Popover/Popover';
import type {
  MenuDefinition,
  MenuItemDefinition,
  MenuItemRenderProps,
} from './Menu';
import {
  defaultPopoverClassName,
  resolveContent,
  resolveItemClassName,
} from './menuUtils';

interface MenuItemProps {
  item: Node<MenuItemDefinition>;
  state: TreeState<MenuItemDefinition>;
  menuRef: React.RefObject<HTMLUListElement | null>;
  rootState: RootMenuTriggerState;
}

interface MenuListProps extends MenuDefinition {
  rootState: RootMenuTriggerState;
  ariaProps?: AriaMenuOptions<MenuItemDefinition>;
  menuRef?: React.RefObject<HTMLUListElement | null>;
}

export function MenuList({
  ariaLabel,
  items,
  selectionMode = 'none',
  selectedKeys,
  rootState,
  ariaProps,
  menuRef: suppliedMenuRef,
}: MenuListProps) {
  const fallbackMenuRef = useRef<HTMLUListElement>(null);
  const menuRef = suppliedMenuRef ?? fallbackMenuRef;
  const state = useTreeState<MenuItemDefinition>({
    items,
    children: item => (
      <Item key={item.id} textValue={item.textValue}>
        {item.textValue}
      </Item>
    ),
    selectionMode,
    selectedKeys,
    disabledKeys: items.filter(item => item.isDisabled).map(item => item.id),
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
      <ul {...menuProps} ref={menuRef} className="ui:outline-none">
        {[...state.collection].map(item => (
          <MenuItem
            key={item.key}
            item={item}
            state={state}
            menuRef={menuRef}
            rootState={rootState}
          />
        ))}
      </ul>
    </FocusScope>
  );
}

export function MenuItem({ item, state, menuRef, rootState }: MenuItemProps) {
  const itemDefinition = item.value;
  const itemRef = useRef<HTMLLIElement>(null);
  const submenuRef = useRef<HTMLUListElement>(null);
  const submenuState = useSubmenuTriggerState(
    { triggerKey: item.key },
    rootState
  );
  const { submenuTriggerProps, submenuProps, popoverProps } =
    useSubmenuTrigger<MenuItemDefinition>(
      {
        parentMenuRef: menuRef,
        submenuRef,
        isDisabled: itemDefinition?.isDisabled || !itemDefinition?.submenu,
      },
      submenuState,
      itemRef
    );
  const { menuItemProps, isDisabled, isFocused, isPressed, isSelected } =
    useMenuItem(
      itemDefinition?.submenu
        ? { ...submenuTriggerProps, key: item.key }
        : {
            key: item.key,
            onAction: itemDefinition?.onAction,
            shouldCloseOnSelect: itemDefinition?.shouldCloseOnSelect,
          },
      state,
      itemRef
    );
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const renderProps: MenuItemRenderProps = {
    isDisabled,
    isFocused,
    isHovered,
    isOpen: !!itemDefinition?.submenu && submenuState.isOpen,
    isPressed,
    isSelected,
  };
  const shouldCloseSubmenu = (element: Element) => {
    if (!popoverProps.shouldCloseOnInteractOutside?.(element)) {
      return false;
    }

    if (menuRef.current?.contains(element)) {
      return true;
    }

    rootState.close();
    return false;
  };

  if (!itemDefinition) {
    return null;
  }

  const submenu = itemDefinition.submenu;

  return (
    <>
      <li
        {...mergeProps(menuItemProps, hoverProps)}
        ref={itemRef}
        className={resolveItemClassName(itemDefinition, renderProps)}
      >
        {resolveContent(itemDefinition.content, renderProps)}
      </li>

      {submenu && submenuState.isOpen && (
        <Popover
          {...popoverProps}
          state={submenuState}
          triggerRef={itemRef}
          trigger="SubmenuTrigger"
          placement="end top"
          offset={submenu.offset ?? 4}
          shouldCloseOnInteractOutside={shouldCloseSubmenu}
          className={cn(
            'ui:my-0',
            submenu.popoverClassName ?? defaultPopoverClassName
          )}
        >
          <MenuList
            {...submenu}
            ariaProps={submenuProps}
            menuRef={submenuRef}
            rootState={rootState}
          />
        </Popover>
      )}
    </>
  );
}
