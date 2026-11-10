import { forwardRef, ReactNode } from 'react';

import { Icon, type IconProps } from '../Icon';
import type { IconType } from '../Icon/IconTypes';
import { Tooltip, type TooltipPlacement } from '../Tooltip/Tooltip';
import { Button, type ButtonProps } from './Button';

export interface IconButtonProps extends Omit<
  ButtonProps,
  | 'children'
  | 'intent'
  | 'size'
  | 'leftIcon'
  | 'rightIcon'
  | 'loadingText'
  | 'aria-label'
> {
  /** Icon name from the sprite */
  icon: IconType;
  /**
   * Accessible name of the button (required). Describe the action and, when
   * there are several similar buttons, its target, e.g. "Delete Assignment 1".
   */
  'aria-label': string;
  /** Defaults to `ghost` */
  intent?: ButtonProps['intent'];
  /** `square` (32px, default) or `square-small` (24px, the WCAG 2.5.8 minimum) */
  size?: 'square' | 'square-small';
  iconSize?: IconProps['size'];
  iconColor?: IconProps['color'];
  /**
   * Visible tooltip on hover/focus. Defaults to the aria-label so sighted
   * mouse and keyboard users also learn what the icon does. Pass `false` to
   * disable, or a node for custom content.
   */
  tooltip?: ReactNode | false;
  tooltipPlacement?: TooltipPlacement;
}

/**
 * Icon-only button. Always focusable and keyboard operable, and always has an
 * accessible name. Use this instead of putting `onClick` on an `<Icon>`.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      intent = 'ghost',
      size = 'square',
      iconSize,
      iconColor = 'current',
      tooltip,
      tooltipPlacement,
      ...buttonProps
    },
    ref
  ) => {
    const button = (
      <Button ref={ref} intent={intent} size={size} {...buttonProps}>
        <Icon
          name={icon}
          size={iconSize ?? (size === 'square-small' ? 'sm' : 'md')}
          color={iconColor}
          decorative
        />
      </Button>
    );

    const tooltipContent =
      tooltip === undefined ? buttonProps['aria-label'] : tooltip;

    if (tooltipContent === false || tooltipContent === null) return button;

    return (
      <Tooltip
        content={tooltipContent}
        placement={tooltipPlacement}
        // The button is already focusable; never add an extra tab stop
        isTriggerFocusable={buttonProps.disabled ? 'auto' : false}
      >
        {button}
      </Tooltip>
    );
  }
);

IconButton.displayName = 'IconButton';
