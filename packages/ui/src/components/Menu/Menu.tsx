import { ButtonHTMLAttributes, ReactNode, RefObject, useRef } from 'react';

import { AriaPopoverProps, useButton, useMenuTrigger } from 'react-aria';
import { useMenuTriggerState } from 'react-stately';

import { cn } from '../../utils/cn';
import { Popover } from '../Popover/Popover';
import { MenuList } from './MenuItem';
import { defaultPopoverClassName } from './menuUtils';

export type MenuKey = string | number;

export interface MenuItemRenderProps {
  isDisabled: boolean;
  isFocused: boolean;
  isHovered: boolean;
  isOpen: boolean;
  isPressed: boolean;
  isSelected: boolean;
}

export interface MenuItemDefinition {
  id: MenuKey;
  textValue: string;
  content: ReactNode | ((renderProps: MenuItemRenderProps) => ReactNode);
  onAction?: () => void;
  isDisabled?: boolean;
  shouldCloseOnSelect?: boolean;
  cursor?: 'default' | 'pointer';
  className?: string | ((renderProps: MenuItemRenderProps) => string);
  submenu?: MenuDefinition;
}

export interface MenuDefinition {
  ariaLabel: string;
  items: MenuItemDefinition[];
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Iterable<MenuKey>;
  popoverClassName?: string;
  offset?: number;
}

export interface MenuTriggerRenderProps {
  isOpen: boolean;
  triggerProps: ButtonHTMLAttributes<HTMLButtonElement>;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export interface MenuProps extends MenuDefinition {
  trigger: (props: MenuTriggerRenderProps) => ReactNode;
  placement?: AriaPopoverProps['placement'];
}

export function Menu({
  ariaLabel,
  items,
  selectionMode,
  selectedKeys,
  popoverClassName,
  offset = 8,
  trigger,
  placement = 'bottom end',
}: MenuProps) {
  const state = useMenuTriggerState({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger<MenuItemDefinition>(
    { type: 'menu' },
    state,
    triggerRef
  );
  const { buttonProps: triggerProps } = useButton(menuTriggerProps, triggerRef);

  return (
    <>
      {trigger({ isOpen: state.isOpen, triggerProps, triggerRef })}

      {state.isOpen && (
        <Popover
          state={state}
          triggerRef={triggerRef}
          placement={placement}
          offset={offset}
          className={cn('ui:my-0', popoverClassName ?? defaultPopoverClassName)}
        >
          <MenuList
            ariaLabel={ariaLabel}
            items={items}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            ariaProps={menuProps}
            rootState={state}
          />
        </Popover>
      )}
    </>
  );
}
