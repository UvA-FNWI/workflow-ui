import React, { useEffect, useState } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { IconType } from './IconTypes';
import { loadSprite, SPRITE_ID } from './spriteData';

const iconVariants = cva('inline-block', {
  variants: {
    size: {
      xs: 'w-3 h-3', // 12px
      sm: 'w-4 h-4', // 16px
      md: 'w-5 h-5', // 20px
      lg: 'w-6 h-6', // 24px
      xl: 'w-8 h-8', // 32px
      '2xl': 'w-10 h-10', // 40px
    },
    color: {
      current: 'text-current',
      primary: 'text-grey-900 dark:text-grey-100',
      secondary: 'text-grey-600 dark:text-grey-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      danger: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

// Global sprite injection promise to prevent concurrent loads
let spritePromise: Promise<void> | null = null;

const injectSprite = async (): Promise<void> => {
  if (typeof document === 'undefined') return;

  // Check if sprite already exists in DOM
  if (document.getElementById(SPRITE_ID)) {
    spritePromise = null; // Reset promise when sprite exists
    return Promise.resolve();
  }

  // If promise exists, await it and check if sprite still exists
  // This handles both pending promises (concurrent loads) and completed promises (sprite removed)
  if (spritePromise) {
    try {
      await spritePromise;
    } catch {
      // Promise rejected, reset and try again
      spritePromise = null;
    }
    // After awaiting, check if sprite exists
    if (document.getElementById(SPRITE_ID)) {
      spritePromise = null;
      return Promise.resolve();
    }
    // Sprite doesn't exist, it was removed after promise completed
    // Reset to allow a new load (important for test isolation)
    spritePromise = null;
  }

  spritePromise = (async () => {
    const spriteContent = await loadSprite();
    if (spriteContent && !document.getElementById(SPRITE_ID)) {
      const spriteContainer = document.createElement('div');
      spriteContainer.style.display = 'none';
      spriteContainer.setAttribute('aria-hidden', 'true');
      spriteContainer.innerHTML = spriteContent.replace(
        '<svg',
        `<svg id="${SPRITE_ID}"`
      );
      document.body.insertBefore(spriteContainer, document.body.firstChild);
    }
    spritePromise = null; // Reset promise after completion
  })();

  return spritePromise;
};

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'color'>,
    VariantProps<typeof iconVariants> {
  /** Icon name from the sprite (e.g., 'accessibility-line', 'alarm-solid') */
  name: IconType;
  /** Accessible label for screen readers */
  label?: string;
  /** Whether the icon is decorative only (hidden from screen readers) */
  decorative?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size,
  color,
  label,
  decorative = false,
  className,
  ...props
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    injectSprite()
      .then(() => {
        if (isMounted) {
          setIsReady(true);
        }
      })
      .catch(() => {
        // Handle sprite loading errors gracefully
        // Icon will still render, just without the use element
        // eslint-disable-next-line no-console
        console.error('Failed to load icon sprite');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const iconClasses = iconVariants({ size, color });

  return (
    <svg
      className={cn(iconClasses, className)}
      aria-hidden={decorative || undefined}
      aria-label={!decorative ? label || name : undefined}
      role={!decorative ? 'img' : undefined}
      {...props}
    >
      {isReady && <use href={`#${name}`} />}
    </svg>
  );
};
