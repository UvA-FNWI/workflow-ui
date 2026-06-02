export const SPRITE_ID = 'datanose-ui-icon-sprite';

// Cache for sprite content and icon names
let spriteContentCache: string | null = null;
let iconNamesCache: string[] | null = null;
let loadPromise: Promise<string> | null = null;

/**
 * Extract icon names from SVG sprite content
 * @param spriteContent - The SVG sprite content as string
 * @returns Array of icon names sorted alphabetically
 */
export const extractIconNames = (spriteContent: string): string[] => {
  const iconIds: string[] = [];
  const symbolRegex = /id="([^"]+)"/g;
  let match;

  while ((match = symbolRegex.exec(spriteContent)) !== null) {
    const iconId = match[1];
    // Filter out the sprite ID itself and any non-icon IDs
    if (iconId !== SPRITE_ID && !iconId.includes('sprite')) {
      iconIds.push(iconId);
    }
  }

  return iconIds.sort();
};

/**
 * Load sprite content with caching and error handling
 */
export const loadSprite = async (): Promise<string> => {
  // Return cached content if available
  if (spriteContentCache !== null) {
    return spriteContentCache;
  }

  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async (): Promise<string> => {
    const path = new URL('./assets/svg-ui-spritesheet.svg', import.meta.url)
      .href;
    const response = await fetch(path);

    if (response.ok) {
      const content = await response.text();
      if (content.includes('<svg') && content.includes('<symbol')) {
        // Cache the successful result
        spriteContentCache = content;
        return content;
      }
    }

    throw new Error('Failed to load SVG sprite: invalid response or content');
  })();

  try {
    return await loadPromise;
  } catch (error) {
    loadPromise = null;
    throw error;
  }
};

/**
 * Get all available icon names from the sprite
 */
export const getIconNames = async (): Promise<string[]> => {
  // Return cached names if available
  if (iconNamesCache !== null) {
    return iconNamesCache;
  }

  const spriteContent = await loadSprite();
  const iconNames = extractIconNames(spriteContent);

  // Cache the result
  iconNamesCache = iconNames;
  return iconNames;
};

/**
 * Validate if an icon name exists in the sprite
 * @param iconName - The icon name to validate
 * @returns Promise that resolves to boolean indicating if icon exists
 */
export const validateIconName = async (iconName: string): Promise<boolean> => {
  const availableIcons = await getIconNames();
  return availableIcons.includes(iconName);
};
