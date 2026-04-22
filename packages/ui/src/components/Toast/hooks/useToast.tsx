// React
import { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

// Initialize i18n
import '../../../i18n/index';
import { ToasterType } from '../Toast';
// App
import { useToastContext } from '../ToastProvider';

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
  /** Show a toast with an explicit type, and without a default title **/
  custom: (type: ToasterType, message: string, options?: ToastOptions) => void;
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
  const { addToast } = useToastContext();
  const { t } = useTranslation('common');

  const defaultTitles = {
    success: t('toast.titles.success'),
    error: t('toast.titles.error'),
    info: t('toast.titles.info'),
    warning: t('toast.titles.warning'),
    note: t('toast.titles.note'),
  };

  const createToast = (
    type: ToasterType,
    message: string,
    options: ToastOptions = {},
    defaultTitle = ''
  ) => {
    const { title, actionLabel, onAction, lifetime } = options;
    addToast({
      type,
      label: title ?? defaultTitle,
      message,
      lifetime,
      ...(actionLabel && onAction
        ? { actionLabel, onAction }
        : { actionLabel: undefined, onAction: undefined }),
    });
  };

  return {
    success: (message, options) =>
      createToast('success', message, options, defaultTitles.success),
    error: (message, options) =>
      createToast('error', message, options, defaultTitles.error),
    info: (message, options) =>
      createToast('info', message, options, defaultTitles.info),
    warning: (message, options) =>
      createToast('warning', message, options, defaultTitles.warning),
    note: (message, options) =>
      createToast('note', message, options, defaultTitles.note),
    custom: (type, message, options) => createToast(type, message, options),
  };
}
