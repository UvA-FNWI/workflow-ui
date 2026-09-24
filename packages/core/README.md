# @uva-fnwi/datanose-core

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
npm install @uva-fnwi/datanose-core
# or
pnpm add @uva-fnwi/datanose-core
```

### As a pnpm workspace dependency (monorepo)

```json
"dependencies": {
  "@uva-fnwi/datanose-core": "workspace:*"
}
```

When working **in this repo**, install from the repository root (`pnpm install`). There is no package-local lockfile. After that:

```bash
pnpm --filter @uva-fnwi/datanose-core test
pnpm --filter @uva-fnwi/datanose-core build
```

React is shared via the workspace catalog (root README). `pnpm install` in this folder joins the root workspace. `npm install` or `yarn install` or `bun install` should not be used.

## Usage

### Option 1: `AuthProvider` + `useAuth` (recommended for React apps)

Wrap your app with `AuthProvider` and access auth state with `useAuth` in any child:

```tsx
import {AuthProvider, useAuth} from "@uva-fnwi/datanose-core";

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
import {configureStore} from "@reduxjs/toolkit";
import {authReducer, AuthService, selectIsAuthenticated} from "@uva-fnwi/datanose-core";

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

This package lives in a monorepo; `main` is protected, so you do the version bump on a branch and open a PR.

From the repo root:

```bash
pnpm --filter @uva-fnwi/datanose-core version patch   # 1.0.0 -> 1.0.1
pnpm --filter @uva-fnwi/datanose-core version minor   # 1.0.0 -> 1.1.0
pnpm --filter @uva-fnwi/datanose-core version major   # 1.0.0 -> 2.0.0
```

That updates `packages/core/package.json`, creates a commit, and creates the git tag for the new version (same as `npm version`). Push your branch with `git push --follow-tags` if you want the tag on the remote.

Open a PR against `main` and merge it. The publish workflow runs when `packages/core/package.json` changes on `main`; it doesn’t use tags.

After release, consumers can pull the new version with:

```bash
pnpm add @uva-fnwi/datanose-core@latest
```
