import { ReactNode, useRef } from 'react';

import { useToast } from 'react-aria';
import type { QueuedToast, ToastState } from 'react-stately';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';
import { ToastContent } from './ToastProvider';

export type ToasterType = 'error' | 'info' | 'success' | 'warning' | 'note';
export type ToasterConfig = {
  id: number;
  type: ToasterType;
  label: string;
  message: string;
  lifetime: number | null;
};

const toastClassGenerator = cva(
  // Base styles
  "ui:relative ui:p-3 ui:w-full ui:break-words ui:grid ui:grid-cols-[auto_1fr_auto] ui:gap-2 ui:items-start ui:shadow-lg ui:before:content-[''] ui:before:absolute ui:before:top-0 ui:before:left-0 ui:before:w-0.5 ui:before:h-full ui:before:block ui:before:z-[1]",
  {
    variants: {
      type: {
        note: 'ui:bg-grey-300 ui:text-grey-900 ui:before:bg-grey-600',
        error: 'ui:bg-red-200 ui:text-grey-900 ui:before:bg-red-600',
        warning: 'ui:bg-orange-200 ui:text-grey-900 ui:before:bg-orange-600',
        info: 'ui:bg-navy-200 ui:text-grey-900 ui:before:bg-navy-700',
        success: 'ui:bg-forest-200 ui:text-grey-900 ui:before:bg-forest-800',
      },
    },
  }
);

interface ToastProps {
  state: ToastState<ToastContent>;
  toast: QueuedToast<ToastContent>;
}

export function Toast({ toast, state }: ToastProps) {
  // Hooks
  const ref = useRef<HTMLDivElement>(null);
  const { toastProps, titleProps, descriptionProps } = useToast(
    { toast },
    state,
    ref
  );

  // Variables
  const typeIconMapping: Record<ToasterType, ReactNode> = {
    error: <Icon name="triangle-exclamation-line" size="sm" color="current" />,
    info: <Icon name="square-info-line" size="sm" color="current" />,
    success: <Icon name="circle-checkmark-line" size="sm" color="current" />,
    warning: (
      <Icon name="triangle-exclamation-line" size="sm" color="current" />
    ),
    note: <Icon name="calendar-edit-line" size="sm" color="current" />,
  };

  // Functions
  const getIcon = (type: ToasterType): ReactNode => typeIconMapping[type];

  // Render
  return (
    <div
      {...toastProps}
      ref={ref}
      className={cn(toastClassGenerator({ type: toast.content.type }))}
    >
      <div className="ui:flex ui:items-center ui:justify-center">
        {getIcon(toast.content.type)}
      </div>
      <div className="ui:flex ui:flex-col ui:gap-1">
        <h1
          {...titleProps}
          className="ui:leading-tight ui:text-sm ui:font-semibold ui:m-0"
        >
          {toast.content.label}
        </h1>
        <span {...descriptionProps} className="ui:text-sm ui:leading-normal">
          {toast.content.message}
        </span>
        {toast.content.actionLabel && (
          <span
            className="ui:w-fit ui:text-sm ui:font-semibold ui:cursor-pointer ui:mt-1"
            onClick={() => {
              toast.content.onAction?.();
              state.close(toast.key);
            }}
          >
            {toast.content.actionLabel}
          </span>
        )}
      </div>
      <div
        className="ui:flex ui:items-center ui:justify-center ui:cursor-pointer ui:p-2"
        onClick={() => state.close(toast.key)}
      >
        <Icon name="cross-line" size="sm" color="current" />
      </div>
    </div>
  );
}
