## Purpose

Short, practical guide to help AI coding agents be productive in this repo (frontend/agzak). Focus is on concrete, discoverable patterns, build flows, and locations where changes usually happen.

## Quick commands (run from `agzak/`)

- Dev server: `npm run dev` (Vite + HMR)
- Build: `npm run build` (runs `tsc -b` then `vite build`)
- Preview production build: `npm run preview`
- Lint: `npm run lint`

Note: building runs a TypeScript build (`tsc -b`) before Vite. Don't omit `tsc -b` in automated build flows.

## Big-picture architecture

- App: React + TypeScript + Vite (see `vite.config.ts`). Source root: `src/` (alias `@` -> `src`).
- Routing: `src/app/router.tsx` uses `react-router-dom`'s browser router with lazy-loaded pages and a Suspense fallback (`AppLoader`). New pages are added by lazy-import + route entry.
- Shell: `src/app/layout.tsx` provides the top-level layout (Header, Outlet, PWA badge).
- Entry: `src/app/main.tsx` mounts `RouterProvider` (the router from `src/app/router.tsx`).
- UI structure: components follow an atoms / molecules / templates / ui split under `src/components/` — prefer that organization for new UI code.

## Important files & directories (reference)

- `vite.config.ts` — alias (`@`) and PWA plugin settings.
- `package.json` — scripts and dependency list (dev dependencies include Vite, TypeScript, Tailwind, etc.).
- `src/app/router.tsx` — canonical example of how routes are added (lazy + Suspense).
- `src/pages/` — each page lives in `src/pages/<Feature>/` and exports a default React component (e.g., `src/pages/Home/HomePage.tsx`).
- `src/components/atoms`, `molecules`, `templates` — component conventions; use `atoms` for tiny building blocks (e.g., `Input.tsx`, `Button_L.tsx`), `molecules` for composed UI, `templates` for entire page scaffolds.
- `src/pwa/` — service worker and PWA registration (`registerSW.ts`, `sw.ts`, `PWABadge.tsx`). PWA manifest comes from `vite.config.ts` plugin config.
- `src/styles/` — Tailwind and global CSS (`index.css`, `components.css`, `fonts.css`).

## Project-specific conventions & examples

- Imports use alias `@` for `src`. Example: `import Input from '@/components/atoms/Input'`.
- Routes are lazy-loaded. To add a page:
  1. Create `src/pages/Feature/FeaturePage.tsx` (default export component).
  2. Add a lazy import in `src/app/router.tsx`: `const FeaturePage = lazy(() => import('@/pages/Feature/FeaturePage'))`.
  3. Add a child route with `suspense(<FeaturePage />)` or wrap in the existing layout.
- Suspense pattern: `const suspense = (el: ReactNode) => <Suspense fallback={fallback}>{el}</Suspense>` where `fallback` is `AppLoader`.
- UI naming: `_L` suffix indicates larger buttons (e.g., `Button_L.tsx`), `_M` for medium. Keep consistent width props (examples in `HomePage.tsx`).

## Build and debugging notes

- Dev: use `npm run dev` in the `agzak` folder (the workspace project). HMR is enabled via the Vite React plugin.
- If the build fails, check TypeScript errors first — `tsc -b` is part of the build pipeline. Running `npx tsc -b` locally reproduces the same type-checking step.
- When investigating route/component load issues, check `src/app/router.tsx` (lazy import paths) and `src/app/main.tsx` to ensure `RouterProvider` is used.

## PWA and static assets

- PWA is enabled via `vite-plugin-pwa` config in `vite.config.ts` (autoUpdate register). Manifest options are declared there; icons live under `public/icons` and `public/`.
- Service worker registration file: `src/pwa/registerSW.ts`. SW implementation: `src/pwa/sw.ts`.

## Linting / formatting

- Lint: `npm run lint` (eslint). Prettier is present in devDependencies — follow existing style in `src/` (Tailwind utility classes + small CSS files under `src/styles`).

## Useful code examples (copyable)

- Importing a component via alias:
  - `import DropDown from '@/components/atoms/DropDown'`
- Lazy route pattern (see `src/app/router.tsx`):
  - `const HomePage = lazy(() => import('@/pages/Home/HomePage'))`
  - Add route: `{ index: true, element: suspense(<HomePage />) }`

## What not to assume

- There are no tests configured in the repo (no `test` script). Don't add test instructions unless you add test tooling.
- Don't assume additional CI or node versions—use the repo's devDependencies and standard Node 18+/LTS for Vite/TS builds.

---

If you'd like, I can iterate on this: merge in any existing agent docs, expand examples (e.g., how to add a component with Tailwind classes) or add short troubleshooting steps for common build errors.
