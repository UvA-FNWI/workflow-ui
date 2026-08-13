import { ButtonHTMLAttributes, ReactNode, RefObject, useRef } from 'react';

import { AriaPopoverProps, useButton, useMenuTrigger } from 'react-aria';
import { useMenuTriggerState } from 'react-stately';

import { cn } from '../../utils/cn';
import type { IconType } from '../Icon/IconTypes';
import { Popover } from '../Popover/Popover';
import type { MenuItemProps } from './MenuItem';
import { MenuList } from './MenuList';
import { defaultPopoverClassName } from './menuUtils';

export type MenuKey = string;
export type MenuItemIcon =
  | IconType
  | Exclude<ReactNode, string | number | boolean>;

export interface MenuItemRenderProps {
  isDisabled: boolean;
  isFocused: boolean;
  isHovered: boolean;
  isOpen: boolean;
  isPressed: boolean;
  isSelected: boolean;
}

export type MenuChildren =
  | React.ReactElement<MenuItemProps>
  | Iterable<MenuChildren>
  | boolean
  | null
  | undefined;

export interface MenuDefinition {
  ariaLabel: string;
  children: MenuChildren;
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
  trigger,
  placement = 'bottom end',
  offset = 8,
  popoverClassName,
  ...definition
}: MenuProps) {
  const state = useMenuTriggerState({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger<MenuItemProps>(
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
          <MenuList {...definition} ariaProps={menuProps} rootState={state} />
        </Popover>
      )}
    </>
  );
}
