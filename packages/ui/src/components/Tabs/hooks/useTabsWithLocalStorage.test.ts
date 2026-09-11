import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';

import { useTabsWithLocalStorage } from './useTabsWithLocalStorage';

const props = { tabs: ['overview', 'settings'], storageKey: 'page:active-tab' };

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

test('restores the selected tab after unmounting and starting a new session', () => {
  const { result, unmount } = renderHook(() => useTabsWithLocalStorage(props));
  expect(result.current.activeIndex).toBe(0);

  act(() => result.current.onTabChange(1));
  expect(localStorage.getItem(props.storageKey)).toBe('settings');
  unmount();

  const restored = renderHook(() => useTabsWithLocalStorage(props));
  expect(restored.result.current.activeIndex).toBe(1);
});

test('restores independent selections when the page key changes', () => {
  localStorage.setItem('other-page:active-tab', 'settings');
  const { result, rerender } = renderHook(useTabsWithLocalStorage, {
    initialProps: props,
  });

  rerender({ ...props, storageKey: 'other-page:active-tab' });
  expect(result.current.activeIndex).toBe(1);
  act(() => result.current.onTabChange(0));

  rerender(props);
  expect(result.current.activeIndex).toBe(0);
  act(() => result.current.onTabChange(1));

  rerender({ ...props, storageKey: 'other-page:active-tab' });
  expect(result.current.activeIndex).toBe(0);
  rerender(props);
  expect(result.current.activeIndex).toBe(1);
});

test('waits for tab data and follows identifiers when tabs are reordered', () => {
  localStorage.setItem(props.storageKey, 'settings');
  const { result, rerender } = renderHook(useTabsWithLocalStorage, {
    initialProps: { ...props, tabs: [] as string[] },
  });
  expect(result.current.activeIndex).toBe(0);
  expect(localStorage.getItem(props.storageKey)).toBe('settings');

  rerender(props);
  expect(result.current.activeIndex).toBe(1);
  rerender({ ...props, tabs: ['settings', 'overview'] });
  expect(result.current.activeIndex).toBe(0);
});

test('falls back to the first tab when a saved tab no longer exists', () => {
  localStorage.setItem(props.storageKey, 'removed');
  const { result } = renderHook(() => useTabsWithLocalStorage(props));
  expect(result.current.activeIndex).toBe(0);
  act(() => result.current.onTabChange(1));
  expect(result.current.activeIndex).toBe(1);
  expect(localStorage.getItem(props.storageKey)).toBe('settings');
});

test('keeps tabs usable when local storage reads and writes fail', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage blocked');
  });
  const { result } = renderHook(() => useTabsWithLocalStorage(props));
  expect(result.current.activeIndex).toBe(0);
  act(() => result.current.onTabChange(1));
  expect(result.current.activeIndex).toBe(1);
});
