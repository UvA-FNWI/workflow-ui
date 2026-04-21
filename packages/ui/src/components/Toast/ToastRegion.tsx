// React
import { useRef } from 'react';

// External
import { useToastRegion } from 'react-aria';

import { cn } from '../../utils/cn';
// App
import { Toast } from './Toast';
import { useToastContext } from './ToastProvider';

export const ToastRegion = () => {
  // Hooks
  const { state } = useToastContext();
  const ref = useRef<HTMLDivElement>(null);
  const { regionProps } = useToastRegion({}, state, ref);

  // Render
  return (
    <div
      {...regionProps}
      ref={ref}
      className={cn(
        // Base layout
        'ui:fixed ui:top-4 ui:right-4 ui:left-4 ui:z-10 ui:flex ui:flex-col ui:gap-3',
        // Full-width on mobile capped at max-w-sm on desktop
        'ui:sm:right-auto ui:sm:left-1/2 ui:sm:w-full ui:sm:max-w-sm ui:sm:-translate-x-1/2'
      )}
    >
      {state.visibleToasts.map(toast => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
};
