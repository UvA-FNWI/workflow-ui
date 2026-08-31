import { HTMLAttributes, PropsWithChildren } from 'react';

export type TabToolbarProps = PropsWithChildren &
  HTMLAttributes<HTMLDivElement>;

const TabToolbar = ({ children, ...otherProps }: TabToolbarProps) => {
  return <div {...otherProps}>{children}</div>;
};

export { TabToolbar };
