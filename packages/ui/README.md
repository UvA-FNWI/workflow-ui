# @uva-fnwi/datanose-ui

Reusable UI component library for DataNose and Thesis Workflow.

## Installation

```bash
pnpm add @uva-fnwi/datanose-ui
```

or

```bash
npm add @uva-fnwi/datanose-ui
```

## Usage

```tsx
import { Checkbox } from '@uva-fnwi/datanose-ui';
```

## Development

This package is part of the workflow-ui pnpm workspace. From the **repository root**:

```bash
pnpm install
pnpm --filter @uva-fnwi/datanose-ui storybook
pnpm --filter @uva-fnwi/datanose-ui test
pnpm --filter @uva-fnwi/datanose-ui build
```

After the root install, `pnpm test`, `pnpm storybook`, and `pnpm build` work from this directory. `pnpm install` here joins the root workspace. `npm install` or `yarn install` or `bun install` should not be used. React comes from the workspace catalog (root README).

## Versioning & Releases

This project uses **Semantic Release** for automated versioning and publishing. Versions are automatically determined based on commit message conventions.

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type              | Version Bump              | Description           | Example                                 |
| ----------------- | ------------------------- | --------------------- | --------------------------------------- |
| `fix`             | **Patch** (1.0.0 → 1.0.1) | Bug fixes             | `fix: resolve checkbox alignment issue` |
| `feat`            | **Minor** (1.0.0 → 1.1.0) | New features          | `feat: add dark theme support`          |
| `BREAKING CHANGE` | **Major** (1.0.0 → 2.0.0) | Breaking changes      | `feat!: redesign button API`            |
| `docs`            | No release                | Documentation changes | `docs: update theming guide`            |
| `style`           | No release                | Code style changes    | `style: format with prettier`           |
| `refactor`        | No release                | Code refactoring      | `refactor: simplify theme logic`        |
| `test`            | No release                | Test changes          | `test: add checkbox unit tests`         |
| `chore`           | No release                | Maintenance tasks     | `chore: update dependencies`            |

### Examples

**Bug Fix (Patch Release):**

```bash
git commit -m "fix: resolve theme toggle not persisting in localStorage"
```

**New Feature (Minor Release):**

```bash
git commit -m "feat: add Toast notification component"
```

**Breaking Change (Major Release):**

```bash
git commit -m "feat!: redesign Checkbox API with new props

BREAKING CHANGE: The isSelected prop has been renamed to checked"
```

**With Scope:**

```bash
git commit -m "feat(checkbox): add indeterminate state support"
```

## Notes

- This library is for stable, reusable components.
- Project-specific components should live within the app itself.
- Always follow conventional commit format for proper version management.
