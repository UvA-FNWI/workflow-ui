import { createContext, ReactNode, useContext } from 'react';

import { useToastState } from 'react-stately';
import type { ToastState } from 'react-stately';

import { ToasterType } from './Toast';

type ToastContent = {
  type: ToasterType;
  label: string;
  message: string;
  lifetime?: number;
} & (
  | {
      actionLabel?: never;
      onAction?: never;
    }
  | {
      actionLabel: ReactNode;
      onAction: () => void;
    }
);

type ToastContextValue = {
  state: ToastState<ToastContent>;
  addToast: (config: ToastContent) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

const MAX_VISIBLE_TOASTS = 8;
const DEFAULT_TOAST_LIFETIME = 5;

export function ToastProvider({ children }: ToastProviderProps) {
  // State
  const state = useToastState<ToastContent>({
    maxVisibleToasts: MAX_VISIBLE_TOASTS,
  });

  // Functions
  const addToast = (config: ToastContent) => {
    state.add(config, {
      timeout:
        config.type === 'error' || config.type === 'warning'
          ? undefined
          : (config.lifetime ?? DEFAULT_TOAST_LIFETIME) * 1000,
    });
  };

  // Variables
  const contextValue: ToastContextValue = {
    state,
    addToast,
  };

  // Render
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

export type { ToastContent };
