# @datanose/core

Shared authentication library for DataNose applications. Provides an OIDC-based auth flow (via `oidc-client-ts`) with support for both SURFconext and Canvas LTI providers.

## What it provides

- **`AuthProvider`** — React context provider that initialises authentication and exposes auth methods via context.
- **`useAuth`** — Hook to access the auth context from any child component.
- **`AuthService`** — Lower-level class for apps that manage auth state themselves (e.g. with Redux).
- **`authReducer`** — Redux-compatible reducer for auth state.
- **Selectors** — `selectAuthUser`, `selectAuthStatus`, `selectAuthProviderType`, `selectIsAuthenticated`.
- **Helpers** — `isEmbedded`, `isEmbeddedInCanvas`, `isImpersonating`, `getDataFromToken`, `getUserAndMetadataForCanvasToken`, `getCanvasTokenFromLocalStorage`, `setCanvasTokenInLocalStorage`, `convertUserToObject`, `isUserAuthenticated`.
- **Types** — `AuthConfig`, `AuthState`, `AuthEventCallbacks`, `ProviderType`, `CustomUserState`.

## Installation

```bash
npm install @datanose/core
# or
pnpm add @datanose/core
```

### As a pnpm workspace dependency (monorepo)

```json
"dependencies": {
  "@datanose/core": "workspace:*"
}
```

## Usage

### Option 1: `AuthProvider` + `useAuth` (recommended for React apps)

Wrap your app with `AuthProvider` and access auth state with `useAuth` in any child:

```tsx
import {AuthProvider, useAuth} from "@datanose/core";

const config = {
    authority: import.meta.env.VITE_AUTH_AUTHORITY,
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
    redirectUri: window.location.origin,
    logoutUri: import.meta.env.VITE_AUTH_LOGOUT_URL,
};

function App() {
    return (
        <AuthProvider config={config} events={{}}>
            <Main />
        </AuthProvider>
    );
}

function Main() {
    const {isAuthenticated, user, surfStartLogin, surfLogout} = useAuth();

    if (!isAuthenticated) {
        return <button onClick={() => surfStartLogin(undefined)}>Log in</button>;
    }

    return (
        <div>
            <p>Hello, {user?.profile.name}</p>
            <button onClick={surfLogout}>Log out</button>
        </div>
    );
}
```

### Option 2: `AuthService` + `authReducer` (for Redux-based apps)

Use this when you want auth state in your Redux store:

```ts
import {authReducer, AuthService, selectIsAuthenticated} from "@datanose/core";
import {configureStore} from "@reduxjs/toolkit";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // ... other reducers
    },
});

export const authClient = new AuthService({
    authority: import.meta.env.VITE_AUTH_AUTHORITY,
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
    redirectUri: window.location.origin,
    logoutUri: import.meta.env.VITE_AUTH_LOGOUT_URL,
});

// Initialise on app start
await authClient.initialize((action) => store.dispatch(action), {
    onUserLoaded: (user) => console.log("User loaded", user),
});

// Read state via selectors
const isAuthenticated = selectIsAuthenticated(store.getState().auth);
```

## API reference

### `AuthProvider`

| Prop       | Type                 | Description                                                       |
| ---------- | -------------------- | ----------------------------------------------------------------- |
| `config`   | `AuthConfig`         | OIDC configuration (authority, clientId, redirectUri, logoutUri?) |
| `events`   | `AuthEventCallbacks` | Optional OIDC event callbacks                                     |
| `children` | `ReactNode`          | —                                                                 |

### `AuthConfig`

```ts
type AuthConfig = {
    authority: string;
    clientId: string;
    redirectUri: string;
    logoutUri?: string;
};
```

### `useAuth`

Returns `AuthContextProps` (extends `AuthState` with all auth methods). Throws if called outside `<AuthProvider>`.

### Selectors

All selectors take an `AuthState` slice as argument (not the full Redux root state):

```ts
selectAuthUser(state); // User | null
selectAuthStatus(state); // "pending" | "fulfilled"
selectAuthProviderType(state); // ProviderType | null
selectIsAuthenticated(state); // boolean
```

## Release process

1. Bump `version` in `packages/core/package.json`
2. Commit and push to `main`
3. Create and push a git tag matching the new version:
    ```bash
    git tag packages/core@1.x.x
    git push origin packages/core@1.x.x
    ```
4. The GitHub Actions publish workflow triggers automatically: it runs tests, builds the package, and publishes to npm.
5. Consumers update via:
    ```bash
    pnpm add @datanose/core@latest
    ```
