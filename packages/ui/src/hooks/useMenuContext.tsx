import { createContext, ReactNode, useContext } from 'react';

import { RootMenuTriggerState, TreeState } from 'react-stately';

import type { MenuItemProps } from '../components/Menu/MenuItem';

interface MenuContextValue {
  state: TreeState<MenuItemProps>;
  menuRef: React.RefObject<HTMLUListElement | null>;
  rootState: RootMenuTriggerState;
}

const MenuContext = createContext<MenuContextValue | null>(null);

interface MenuProviderProps extends MenuContextValue {
  children: ReactNode;
}

export function MenuProvider({ children, ...value }: MenuProviderProps) {
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('MenuItem must be rendered inside a Menu.');
  }

  return context;
}
