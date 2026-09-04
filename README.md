# Workflow UI

pnpm workspace: the app at the repo root, plus `@uva-fnwi/datanose-ui` and `@uva-fnwi/datanose-core` under `packages/`.

## Development

Install **once from this directory**. There is a single lockfile (`pnpm-lock.yaml`). Do not add `pnpm-lock.yaml` or `pnpm-workspace.yaml` under `packages/*`.

```bash
pnpm install
```

`pnpm install` from `packages/ui` or `packages/core` uses this workspace (no nested lockfile). `npm install` or `yarn install` or `bun install` should not be used. Add dependencies from the root with `--filter`, or from a package folder with `pnpm add`. After a root install, `pnpm test`, `pnpm exec tsc`, and `pnpm storybook` from a package folder are fine.

```bash
pnpm dev
pnpm --filter @uva-fnwi/datanose-ui test
pnpm --filter @uva-fnwi/datanose-ui storybook
pnpm --filter @uva-fnwi/datanose-core test
```

### Shared React (catalog)

`react`, `react-dom`, `@types/react`, and `@types/react-dom` are pinned in `pnpm-workspace.yaml` (`catalog:` + `overrides:`). Package.json files use `"react": "catalog:"`. Published peer ranges stay `^19.0.0`.

To bump that set, change the range in `pnpm-workspace.yaml` and run `pnpm install`, or:

```bash
pnpm update --latest react react-dom @types/react @types/react-dom
```

That updates the catalog entry. Leave the `overrides:` values as `"catalog:"` so they follow. Then `pnpm install --frozen-lockfile` should still pass.

### Adding a dependency

```bash
# App (workspace root)
pnpm add some-pkg
pnpm add -D some-dev-pkg

# A workspace package
pnpm --filter @uva-fnwi/datanose-ui add some-pkg
pnpm --filter @uva-fnwi/datanose-core add -D some-dev-pkg
```

Only put a package in `catalog:` when every workspace project must share one version (React-family). Everything else stays a normal specifier in that package’s `package.json`.

### Updating dependencies

```bash
pnpm outdated -r
pnpm update                 # within declared ranges
pnpm update --latest vite   # one package, may cross major
```

Dependabot (when enabled) can update npm/pnpm in this repo, including catalog entries. Review PRs that touch `react` / the catalog: the `catalog:` protocol in package.json and `"catalog:"` overrides should stay as-is. If a PR rewrites those to a raw version, restore the protocol and bump the catalog instead.

## Vite

This app uses Vite with HMR and ESLint. Two official React plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Testing

### Unit Tests (Vitest)

Unit tests use [Vitest](https://vitest.dev/) with `jsdom` environment. Test files live alongside the source code in `__tests__/` directories.

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

**Configuration:** `vitest.config.ts`

**Conventions:**

- Place test files in `__tests__/` directories next to the code being tested
- Name test files `<module>.test.ts` or `<module>.test.tsx`
- Use `@testing-library/react` for component tests

### E2E Tests (Playwright)

End-to-end tests use [Playwright](https://playwright.dev/).

```bash
pnpm e2e-test
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            // Other configs...

            // Remove tseslint.configs.recommended and replace with this
            tseslint.configs.recommendedTypeChecked,
            // Alternatively, use this for stricter rules
            tseslint.configs.strictTypeChecked,
            // Optionally, add this for stylistic rules
            tseslint.configs.stylisticTypeChecked,

            // Other configs...
        ],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactDom from "eslint-plugin-react-dom";
import reactX from "eslint-plugin-react-x";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            // Other configs...
            // Enable lint rules for React
            reactX.configs["recommended-typescript"],
            // Enable lint rules for React DOM
            reactDom.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```
