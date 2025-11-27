// React
import { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

// Initialize i18n
import '../../../i18n/index';
import { ToasterType } from '../Toast';
// App
import { ToastContent, useToastContext } from '../ToastProvider';

type ToastOptions = {
  /** Custom title for the toast **/
  title?: string;
  /** Action button label **/
  actionLabel?: ReactNode;
  /** Callback fired when action button is clicked **/
  onAction?: () => void;
  /** Toast lifetime in seconds (default varies by type) **/
  lifetime?: number;
};

type ToastMethods = {
  /** Show a success toast **/
  success: (message: string, options?: ToastOptions) => void;
  /** Show an error toast **/
  error: (message: string, options?: ToastOptions) => void;
  /** Show an info toast **/
  info: (message: string, options?: ToastOptions) => void;
  /** Show a warning toast **/
  warning: (message: string, options?: ToastOptions) => void;
  /** Show a note toast **/
  note: (message: string, options?: ToastOptions) => void;
};

/**
 * Hook that provides easy methods to show different types of toasts
 *
 * @example
 * const toast = useToast();
 *
 * // Simple success toast with default title
 * toast.success("Data saved successfully");
 *
 * // Error toast with custom title and action
 * toast.error("Failed to save data", {
 *   title: "Save Error",
 *   actionLabel: "Retry",
 *   onAction: () => handleRetry()
 * });
 */
export function useToast(): ToastMethods {
  // Hooks
  const { addToast } = useToastContext();
  const { t } = useTranslation('common');

  // Variables
  const defaultTitles = {
    success: t('toast.titles.success'),
    error: t('toast.titles.error'),
    info: t('toast.titles.info'),
    warning: t('toast.titles.warning'),
    note: t('toast.titles.note'),
  };

  // Functions
  const createToast = (
    type: ToasterType,
    message: string,
    options: ToastOptions = {}
  ) => {
    const { title, actionLabel, onAction, lifetime } = options;

    const toastContent: ToastContent = {
      type,
      label: title || defaultTitles[type],
      message,
      lifetime,
      ...(actionLabel && onAction
        ? { actionLabel, onAction }
        : { actionLabel: undefined, onAction: undefined }),
    };

    addToast(toastContent);
  };

  const success = (message: string, options?: ToastOptions) => {
    createToast('success', message, options);
  };

  const error = (message: string, options?: ToastOptions) => {
    createToast('error', message, options);
  };

  const info = (message: string, options?: ToastOptions) => {
    createToast('info', message, options);
  };

  const warning = (message: string, options?: ToastOptions) => {
    createToast('warning', message, options);
  };

  const note = (message: string, options?: ToastOptions) => {
    createToast('note', message, options);
  };

  return {
    success,
    error,
    info,
    warning,
    note,
  };
}
