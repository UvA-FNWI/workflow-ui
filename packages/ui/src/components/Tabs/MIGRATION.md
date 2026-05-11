# Tabs Component Migration Guide for DN 2.0

The Tabs component has been refactored to follow the controlled component pattern and remove router dependencies, making it more flexible and reusable.

## Breaking Changes

### Before (Router-dependent)

```tsx
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@uva-fnwi/datanose-ui';

// Component was tightly coupled to React Router
<Tabs baseUrl="/admin">
  <TabList>
    <Tab href="/overview">Overview</Tab>
    <Tab href="/settings">Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Overview content</TabPanel>
    <TabPanel>Settings content</TabPanel>
  </TabPanels>
</Tabs>;
```

### After (Controlled Component)

```tsx
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@uva-fnwi/datanose-ui';

// Option 1: Uncontrolled (simplest)
<Tabs defaultActiveIndex={0}>
  <TabList>
    <Tab>Overview</Tab>
    <Tab>Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Overview content</TabPanel>
    <TabPanel>Settings content</TabPanel>
  </TabPanels>
</Tabs>;

// Option 2: Controlled
const [activeIndex, setActiveIndex] = useState(0);

<Tabs activeIndex={activeIndex} onTabChange={setActiveIndex}>
  <TabList>
    <Tab>Overview</Tab>
    <Tab>Settings</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Overview content</TabPanel>
    <TabPanel>Settings content</TabPanel>
  </TabPanels>
</Tabs>;
```

## Router Integration

If you need URL synchronization, use the provided hooks:

### With React Router

```tsx
import { useNavigate, useParams } from 'react-router-dom';

import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useTabsWithRouter,
} from '@uva-fnwi/datanose-ui';

function MyPage() {
  const tabProps = useTabsWithRouter({
    tabs: ['overview', 'settings', 'users'],
    basePath: '/admin',
    useRouter: () => {
      const navigate = useNavigate();
      const { tab } = useParams();
      return { currentTab: tab, navigate };
    },
  });

  return (
    <Tabs {...tabProps}>
      <TabList>
        <Tab>Overview</Tab>
        <Tab>Settings</Tab>
        <Tab>Users</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>Overview content</TabPanel>
        <TabPanel>Settings content</TabPanel>
        <TabPanel>Users content</TabPanel>
      </TabPanels>
    </Tabs>
  );
}
```

### Note that any router implementation would work in this setup (also next.js or a manual implementation)

## API Changes

| Old Prop  | New Prop              | Description                           |
| --------- | --------------------- | ------------------------------------- |
| `baseUrl` | Removed               | Use router hooks for URL management   |
| -         | `activeIndex?`        | Current active tab index (controlled) |
| -         | `defaultActiveIndex?` | Default active tab (uncontrolled)     |
| -         | `onTabChange?`        | Callback when tab changes             |

## Benefits

- ✅ **Router agnostic**: Works with any router or no router
- ✅ **Smaller bundle**: No forced React Router dependency
- ✅ **Better testing**: Can be tested without router setup
- ✅ **More flexible**: Consumers control URL patterns
- ✅ **Standard pattern**: Follows React controlled component conventions
