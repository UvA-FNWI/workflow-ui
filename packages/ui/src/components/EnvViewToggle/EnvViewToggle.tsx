import { useSyncExternalStore } from 'react';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon/Icon';

const STORAGE_KEY = 'datanose-production-view';

export interface EnvViewToggleProps {
  className?: string;
}

const listeners = new Set<() => void>();

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function toggle() {
  const next = !getSnapshot();
  localStorage.setItem(STORAGE_KEY, String(next));
  listeners.forEach(l => l());
}

export function useProductionView() {
  const isProductionView = useSyncExternalStore(subscribe, getSnapshot);
  return { isProductionView, toggle };
}

export function EnvViewToggle({ className }: EnvViewToggleProps) {
  const { isProductionView, toggle } = useProductionView();

  return (
    <button
      type="button"
      onClick={toggle}
      title={
        isProductionView ? 'Show environment styling' : 'Show production view'
      }
      className={cn(
        'hover:ui:bg-grey-100 ui:fixed ui:bottom-4 ui:left-4 ui:z-50 ui:flex ui:h-10 ui:w-10 ui:items-center ui:justify-center ui:rounded-full ui:bg-white ui:shadow-md ui:transition-colors',
        className
      )}
    >
      <Icon
        name={isProductionView ? 'unvisible-line' : 'visible-line'}
        size="md"
        color="current"
      />
    </button>
  );
}
