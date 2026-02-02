// React
import { useRef } from 'react';

// External
import { useToastRegion } from 'react-aria';

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
      className="ui:top-sm ui:fixed ui:left-1/2 ui:z-13 ui:flex ui:w-1/5 ui:-translate-x-1/2 ui:translate-y-0 ui:flex-col ui:gap-3"
    >
      {state.visibleToasts.map(toast => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
};
