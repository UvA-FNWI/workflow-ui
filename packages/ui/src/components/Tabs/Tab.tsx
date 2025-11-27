import { PropsWithChildren } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn';

const tabClassGenerator = cva(
  'ui:p-3 ui:text-sm ui:flex ui:items-center ui:border-b ui:border-transparent ui:cursor-pointer ui:bg-transparent ui:border-0 ui:border-b ui:transition-colors ui:duration-150 ui:ease-in-out',
  {
    variants: {
      isActive: {
        true: 'ui:font-semibold ui:border-black ui:cursor-pointer',
        false: 'ui:font-normal',
      },
      disabled: {
        true: 'ui:opacity-50 ui:cursor-not-allowed ui:pointer-events-auto',
        false: '',
      },
    },
    defaultVariants: {
      isActive: false,
      disabled: false,
    },
  }
);

export interface TabProps extends PropsWithChildren {
  isActive?: boolean;
  onTabClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const Tab: React.FunctionComponent<TabProps> = ({
  children,
  isActive = false,
  onTabClick,
  disabled = false,
  hidden = false,
  ref,
}) => {
  return hidden ? (
    <></>
  ) : (
    <button
      onClick={() => !disabled && onTabClick?.()}
      role="tab"
      className={cn(tabClassGenerator({ isActive, disabled }))}
      aria-selected={isActive}
      aria-disabled={disabled}
      type="button"
      ref={ref}
    >
      {children}
    </button>
  );
};

export { Tab };
