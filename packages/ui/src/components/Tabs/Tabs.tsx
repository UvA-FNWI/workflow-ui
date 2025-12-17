import {
  Activity,
  Children,
  isValidElement,
  ReactElement,
  ReactNode,
  useRef,
} from 'react';

import { useFocusRing, useTab, useTabList, useTabPanel } from 'react-aria';
import {
  Item,
  type Key,
  type Node,
  TabListState,
  useTabListState,
} from 'react-stately';

import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { Pill } from '../Pill/Pill';

const tabListVariants = cva(
  'ui:flex ui:border-b-2 ui:border-grey-200 ui:dark:border-grey-700',
  {
    variants: {
      orientation: {
        horizontal: 'ui:flex-row',
        vertical:
          'ui:flex-col ui:border-b-0 ui:border-r ui:border-grey-200 ui:dark:border-grey-700',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

const tabVariants = cva(
  'ui:cursor-pointer ui:px-4 ui:py-2.5 ui:text-sm ui:font-normal ui:transition-colors ui:outline-none ui:border-b-2 ui:-mb-px',
  {
    variants: {
      isSelected: {
        true: 'ui:border-grey-900 ui:text-grey-900 ui:font-semibold ui:dark:border-grey-100 ui:dark:text-grey-100',
        false:
          'ui:border-transparent ui:text-grey-600 ui:dark:text-grey-400 hover:ui:text-grey-900 hover:ui:border-grey-300 ui:dark:hover:text-grey-200 ui:dark:hover:border-grey-600',
      },
      isDisabled: {
        true: 'ui:cursor-not-allowed ui:opacity-50 hover:ui:text-grey-600 hover:ui:border-transparent ui:dark:hover:text-grey-400',
        false: '',
      },
      isFocusVisible: {
        true: 'ui:ring-2 ui:ring-navy-600 ui:ring-offset-2 ui:dark:ring-sky-500 ui:dark:ring-offset-grey-900',
        false: '',
      },
      orientation: {
        horizontal: '',
        vertical: 'ui:border-b-0 ui:border-r-2 ui:-mr-px ui:mb-0 ui:text-left',
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        orientation: 'vertical',
        class:
          'ui:border-r-grey-900 ui:dark:border-r-grey-100 ui:border-b-transparent',
      },
      {
        isSelected: false,
        orientation: 'vertical',
        class:
          'ui:border-r-transparent hover:ui:border-r-grey-300 ui:dark:hover:border-r-grey-600',
      },
    ],
    defaultVariants: {
      isSelected: false,
      isDisabled: false,
      isFocusVisible: false,
      orientation: 'horizontal',
    },
  }
);

const tabPanelVariants = cva('ui:p-4 ui:outline-none', {
  variants: {
    isFocusVisible: {
      true: 'ui:ring-2 ui:ring-navy-600 ui:ring-offset-2 ui:dark:ring-sky-500 ui:dark:ring-offset-grey-900',
      false: '',
    },
  },
  defaultVariants: {
    isFocusVisible: false,
  },
});

export type TabsVariantProps = VariantProps<typeof tabListVariants>;

export interface TabProps {
  /** Unique key for the tab. If not provided, the index will be used. */
  id?: Key;
  /** The title/label displayed in the tab header */
  title: ReactNode;
  /** Optional count to display as a badge/pill next to the title */
  count?: number;
  /** Whether the tab is disabled */
  isDisabled?: boolean;
  /** The content of the tab panel */
  children: ReactNode;
}

/**
 * Tab component, used as a child of Tabs to define individual tab items.
 * This component doesn't render anything directly; it's used to collect tab data.
 */
export function Tab(_props: TabProps): ReactElement {
  // This component is only used to collect props, it doesn't render anything
  // The actual rendering is handled by the Tabs component
  return null as unknown as ReactElement;
}

// Mark Tab as a tab item for identification
Tab.displayName = 'Tab';

export interface TabsProps {
  /** Tab children - use <Tab> components */
  children: ReactNode;
  /** The currently selected tab key (controlled) */
  selectedKey?: Key | null;
  /** The default selected tab key (uncontrolled) */
  defaultSelectedKey?: Key;
  /** Callback when the selected tab changes */
  onSelectionChange?: (key: Key) => void;
  /** Whether all tabs are disabled */
  isDisabled?: boolean;
  /** The orientation of the tabs */
  orientation?: 'horizontal' | 'vertical';
  /** Accessible label for the tab list */
  'aria-label'?: string;
  /** ID of the element that labels the tab list */
  'aria-labelledby'?: string;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the tab list */
  tabListClassName?: string;
  /** Additional className for the tab panel */
  tabPanelClassName?: string;
}

interface TabButtonProps<T> {
  item: Node<T>;
  state: TabListState<T>;
  orientation?: 'horizontal' | 'vertical';
  count?: number;
}

function TabButton<T>({
  item,
  state,
  orientation = 'horizontal',
  count,
}: TabButtonProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const { tabProps, isSelected, isDisabled } = useTab(
    { key: item.key },
    state,
    ref
  );
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <div
      {...tabProps}
      {...focusProps}
      ref={ref}
      className={cn(
        tabVariants({
          isSelected,
          isDisabled,
          isFocusVisible,
          orientation,
        })
      )}
    >
      {item.rendered}
      {count !== undefined && (
        <Pill variant={isSelected ? 'red' : 'grey'} className="ui:ml-2">
          {count}
        </Pill>
      )}
    </div>
  );
}

interface TabPanelInternalProps<T> {
  state: TabListState<T>;
  item: Node<T>;
  className?: string;
}

function TabPanelInternal<T>({
  state,
  item,
  className,
}: TabPanelInternalProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const { tabPanelProps } = useTabPanel({ id: item.key }, state, ref);
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <div
      {...tabPanelProps}
      {...focusProps}
      ref={ref}
      className={cn(tabPanelVariants({ isFocusVisible }), className)}
    >
      {item.props.children}
    </div>
  );
}

// Helper type for extracted tab data
interface ExtractedTabData {
  key: Key;
  title: ReactNode;
  count?: number;
  content: ReactNode;
  isDisabled?: boolean;
}

// Helper to extract tab data from children
function getTabsFromChildren(children: ReactNode): {
  tabData: ExtractedTabData[];
  disabledKeys: Key[];
} {
  const tabData: ExtractedTabData[] = [];
  const disabledKeys: Key[] = [];

  Children.forEach(children, (child, index) => {
    if (isValidElement(child) && child.type === Tab) {
      const props = child.props as TabProps;
      const key = props.id ?? `tab-${index}`;

      tabData.push({
        key,
        title: props.title,
        count: props.count,
        content: props.children,
        isDisabled: props.isDisabled,
      });

      if (props.isDisabled) {
        disabledKeys.push(key);
      }
    }
  });

  return { tabData, disabledKeys };
}

export function Tabs({
  children,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  isDisabled = false,
  orientation = 'horizontal',
  className,
  tabListClassName,
  tabPanelClassName,
  ...props
}: TabsProps) {
  const ariaProps = {
    'aria-label': props['aria-label'],
    'aria-labelledby': props['aria-labelledby'],
  };

  // Extract tab data from children
  const { tabData, disabledKeys } = getTabsFromChildren(children);

  // Create a lookup map for counts
  const countMap = new Map(
    tabData
      .filter(tab => tab.count !== undefined)
      .map(tab => [tab.key, tab.count])
  );

  // Create Item elements for react-stately
  const items = tabData.map(tab => (
    <Item key={tab.key} title={tab.title}>
      {tab.content}
    </Item>
  ));

  const state = useTabListState({
    children: items,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    isDisabled,
    disabledKeys,
    ...ariaProps,
  });

  const ref = useRef<HTMLDivElement>(null);
  const { tabListProps } = useTabList(
    {
      orientation,
      isDisabled,
      disabledKeys,
      ...ariaProps,
    },
    state,
    ref
  );

  return (
    <div
      className={cn(
        orientation === 'vertical' ? 'ui:flex ui:flex-row' : '',
        className
      )}
    >
      <div
        {...tabListProps}
        ref={ref}
        className={cn(tabListVariants({ orientation }), tabListClassName)}
      >
        {[...state.collection].map(item => (
          <TabButton
            key={item.key}
            item={item}
            state={state}
            orientation={orientation}
            count={countMap.get(item.key)}
          />
        ))}
      </div>
      {[...state.collection].map(item => (
        <Activity
          key={item.key}
          mode={state.selectedKey === item.key ? 'visible' : 'hidden'}
        >
          <TabPanelInternal
            state={state}
            item={item}
            className={tabPanelClassName}
          />
        </Activity>
      ))}
    </div>
  );
}
