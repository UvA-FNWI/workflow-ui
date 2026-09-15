import { useState } from 'react';

type UseTabsWithLocalStorageProps = {
  /** Stable tab identifiers, in display order. */
  tabs: string[];
  /** A unique key for this page's tab selection. */
  storageKey: string;
};

function readTab(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

/**
 * Opt-in persistence for Tabs. Consumers using URL paths can keep using
 * useTabsWithRouter instead. Store identifiers so reordered tabs stay selected.
 *
 * @example
 * const tabProps = useTabsWithLocalStorage({
 *   tabs: ['overview', 'settings'],
 *   storageKey: 'admin:active-tab',
 * });
 * // <Tabs {...tabProps}>...</Tabs>
 */
export function useTabsWithLocalStorage({
  tabs,
  storageKey,
}: UseTabsWithLocalStorageProps) {
  const [selection, setSelection] = useState(() => ({
    storageKey,
    tab: readTab(storageKey),
  }));

  // A router can reuse the same component for a different page.
  if (selection.storageKey !== storageKey) {
    setSelection({ storageKey, tab: readTab(storageKey) });
  }

  const savedIndex = selection.tab === null ? -1 : tabs.indexOf(selection.tab);
  const activeIndex = Math.max(0, savedIndex);

  const onTabChange = (index: number) => {
    const tab = tabs[index];
    if (tab === undefined) return;

    setSelection({ storageKey, tab });
    try {
      localStorage.setItem(storageKey, tab);
    } catch {
      // Tabs still work when storage is unavailable or full.
    }
  };

  return { activeIndex, onTabChange };
}
