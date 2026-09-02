import React, { useEffect, useState } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { IconType } from './IconTypes';
import { loadSprite, SPRITE_ID } from './spriteData';

const iconVariants = cva('ui:inline-block', {
  variants: {
    size: {
      xs: 'ui:h-3 ui:w-3', // 12px
      sm: 'ui:h-4 ui:w-4', // 16px
      md: 'ui:h-5 ui:w-5', // 20px
      lg: 'ui:h-6 ui:w-6', // 24px
      xl: 'ui:h-8 ui:w-8', // 32px
      '2xl': 'ui:h-10 ui:w-10', // 40px
    },
    color: {
      current: 'ui:text-current',
      primary: 'ui:text-black ui:dark:text-grey-100',
      secondary: 'ui:text-grey-600 ui:dark:text-grey-400',
      success: 'ui:text-green-600 ui:dark:text-green-400',
      warning: 'ui:text-yellow-600 ui:dark:text-yellow-400',
      danger: 'ui:text-red-600 ui:dark:text-red-400',
      info: 'ui:text-blue-600 ui:dark:text-blue-400',
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
      spriteContainer.innerHTML = spriteContent
        .replace('<svg', `<svg id="${SPRITE_ID}"`)
        .replace(/<title>[^<]*<\/title>/g, '');
      document.body.insertBefore(spriteContainer, document.body.firstChild);
    }
    spritePromise = null; // Reset promise after completion
  })();

  return spritePromise;
};

export interface IconProps
  extends
    Omit<React.SVGProps<SVGSVGElement>, 'name' | 'color'>,
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
