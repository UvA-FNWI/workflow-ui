import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for integrating Tabs component with React Router
 * This hook provides URL synchronization for tab state
 *
 * @example
 * import { useTabsWithRouter } from '@uva-fnwi/datanose-ui';
 *
 * function MyPage() {
 *   const tabRouterProps = useTabsWithRouter({
 *     tabs: ['overview', 'settings', 'users'],
 *     basePath: '/admin',
 *     useRouter: () => {
 *       const navigate = useNavigate();
 *       const { tab } = useParams();
 *       return { currentTab: tab, navigate };
 *     }
 *   });
 *
 *   return (
 *     <Tabs {...tabRouterProps}>
 *       <TabList>
 *         <Tab>Overview</Tab>
 *         <Tab>Settings</Tab>
 *         <Tab>Users</Tab>
 *       </TabList>
 *       <TabPanels>
 *         <TabPanel>Overview content</TabPanel>
 *         <TabPanel>Settings content</TabPanel>
 *         <TabPanel>Users content</TabPanel>
 *       </TabPanels>
 *     </Tabs>
 *   );
 * }
 */

type RouterHook = {
  currentTab?: string;
  navigate: (path: string) => void;
};

type UseTabsWithRouterProps = {
  /** Array of tab identifiers that match URL segments */
  tabs: string[];
  /** Base path for tab URLs */
  basePath: string;
  /** Function that returns router state and navigation function */
  useRouter: () => RouterHook;
  /** Default tab index when no URL match is found */
  defaultActiveIndex?: number;
};

type UseTabsWithRouterReturn = {
  activeIndex?: number;
  onTabChange: (index: number) => void;
};

export function useTabsWithRouter({
  tabs,
  basePath,
  useRouter,
  defaultActiveIndex = 0,
}: UseTabsWithRouterProps): UseTabsWithRouterReturn {
  const { currentTab, navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState<number>(defaultActiveIndex);

  // Sync activeIndex with URL
  useEffect(() => {
    if (currentTab) {
      const index = tabs.findIndex(tab => tab === currentTab);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [currentTab, tabs]);

  // Handle tab change
  const handleTabChange = useCallback(
    (index: number) => {
      const tabPath = tabs[index];
      if (tabPath) {
        const fullPath = `${basePath}/${tabPath}`;
        navigate(fullPath);
      }
    },
    [tabs, basePath, navigate]
  );

  return {
    activeIndex,
    onTabChange: handleTabChange,
  };
}

/**
 * Alternative hook that works with any router library
 * by providing more generic URL synchronization utilities
 *
 * @example
 * import { useTabsWithUrl } from '@uva-fnwi/datanose-ui';
 *
 * function MyPage() {
 *   const tabProps = useTabsWithUrl({
 *     getCurrentTab: () => window.location.pathname.split('/').pop(),
 *     navigateToTab: (tabId) => window.history.pushState({}, '', `/path/${tabId}`),
 *     tabs: ['tab1', 'tab2', 'tab3'],
 *   });
 *
 *   return <Tabs {...tabProps}>...</Tabs>;
 * }
 */
type UseTabsWithUrlProps = {
  /** Function to get current tab identifier from URL */
  getCurrentTab: () => string | undefined;
  /** Function to navigate to a tab */
  navigateToTab: (tabId: string) => void;
  /** Array of tab identifiers */
  tabs: string[];
  /** Default tab index */
  defaultActiveIndex?: number;
};

export function useTabsWithUrl({
  getCurrentTab,
  navigateToTab,
  tabs,
  defaultActiveIndex = 0,
}: UseTabsWithUrlProps): UseTabsWithRouterReturn {
  const [activeIndex, setActiveIndex] = useState<number>(defaultActiveIndex);

  // Sync with URL on mount and when URL changes
  useEffect(() => {
    const currentTab = getCurrentTab();
    if (currentTab) {
      const index = tabs.findIndex(tab => tab === currentTab);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [getCurrentTab, tabs]);

  const handleTabChange = useCallback(
    (index: number) => {
      const tabId = tabs[index];
      if (tabId) {
        navigateToTab(tabId);
      }
    },
    [tabs, navigateToTab]
  );

  return {
    activeIndex,
    onTabChange: handleTabChange,
  };
}
