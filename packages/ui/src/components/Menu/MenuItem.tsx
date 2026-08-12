import { ReactNode, useContext, useRef } from 'react';

import {
  mergeProps,
  useHover,
  useMenuItem,
  useSubmenuTrigger,
} from 'react-aria';
import { useSubmenuTriggerState } from 'react-stately';

import { useIsSmallScreen } from '../../hooks/useIsSmallScreen';
import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import type { IconType } from '../Icon/IconTypes';
import { Popover } from '../Popover/Popover';
import type {
  MenuChildren,
  MenuDefinition,
  MenuItemIcon,
  MenuItemRenderProps,
  MenuKey,
} from './Menu';
import { MenuContext, MenuList } from './MenuList';
import {
  defaultPopoverClassName,
  resolveItemClassName,
  resolveLabel,
} from './menuUtils';

export interface MenuItemProps {
  id: MenuKey;
  /** Plain text used for keyboard navigation. Inferred when label is a string. */
  textValue?: string;
  icon?: MenuItemIcon;
  label: ReactNode | ((renderProps: MenuItemRenderProps) => ReactNode);
  children?: MenuChildren;
  onAction?: () => void;
  isDisabled?: boolean;
  shouldCloseOnSelect?: boolean;
  className?: string | ((renderProps: MenuItemRenderProps) => string);
  selectionMode?: MenuDefinition['selectionMode'];
  selectedKeys?: MenuDefinition['selectedKeys'];
  popoverClassName?: string;
  offset?: number;
}

function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('MenuItem must be rendered inside a Menu.');
  }
  return context;
}

export function MenuItem({
  id,
  icon,
  label,
  children,
  onAction,
  isDisabled: isDisabledProp,
  shouldCloseOnSelect,
  className,
  selectionMode,
  selectedKeys,
  popoverClassName,
  offset,
}: MenuItemProps) {
  const { state, menuRef, rootState } = useMenuContext();
  const item = state.collection.getItem(id)!;
  const isSmallScreen = useIsSmallScreen();
  const itemRef = useRef<HTMLLIElement>(null);
  const submenuRef = useRef<HTMLUListElement>(null);
  const submenuState = useSubmenuTriggerState(
    { triggerKey: item.key },
    rootState
  );
  const { submenuTriggerProps, submenuProps, popoverProps } =
    useSubmenuTrigger<MenuItemProps>(
      {
        parentMenuRef: menuRef,
        submenuRef,
        isDisabled: isDisabledProp || !children,
      },
      submenuState,
      itemRef
    );
  const { menuItemProps, isDisabled, isFocused, isPressed, isSelected } =
    useMenuItem(
      children
        ? { ...submenuTriggerProps, key: item.key }
        : { key: item.key, onAction, shouldCloseOnSelect },
      state,
      itemRef
    );
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const renderProps: MenuItemRenderProps = {
    isDisabled,
    isFocused,
    isHovered,
    isOpen: !!children && submenuState.isOpen,
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

  return (
    <>
      <li
        {...mergeProps(menuItemProps, hoverProps)}
        ref={itemRef}
        className={resolveItemClassName(className, renderProps)}
      >
        {icon !== undefined &&
          icon !== null &&
          (typeof icon === 'string' ? (
            <Icon
              name={icon as IconType}
              size="lg"
              color="current"
              decorative
            />
          ) : (
            <span className="ui:flex ui:h-6 ui:w-6 ui:shrink-0 ui:items-center ui:justify-center">
              {icon}
            </span>
          ))}
        {resolveLabel(label, renderProps)}
        {children && (
          <Icon
            name="chevron-right-line"
            size="md"
            color="current"
            decorative
            className="ui:ml-auto ui:shrink-0"
          />
        )}
      </li>

      {children && submenuState.isOpen && (
        <Popover
          {...popoverProps}
          state={submenuState}
          triggerRef={itemRef}
          trigger="SubmenuTrigger"
          placement={isSmallScreen ? 'bottom start' : 'end top'}
          offset={offset ?? 4}
          shouldCloseOnInteractOutside={shouldCloseSubmenu}
          className={cn('ui:my-0', popoverClassName ?? defaultPopoverClassName)}
        >
          <MenuList
            ariaLabel={item.textValue}
            children={children}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            ariaProps={submenuProps}
            menuRef={submenuRef}
            rootState={rootState}
          />
        </Popover>
      )}
    </>
  );
}
