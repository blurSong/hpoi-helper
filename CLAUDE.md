# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Tampermonkey userscript framework for [hpoi.net](https://www.hpoi.net), modeled after Bilibili-Evolved's architecture. Written in TypeScript, built with Vite + `vite-plugin-monkey`. All components compile into a single `dist/hpoi-helper.user.js`.

## Commands

```bash
pnpm install          # Install dependencies

pnpm dev              # Start dev server (Tampermonkey installs proxy script, auto hot-reloads)
pnpm build            # Production build → dist/hpoi-helper.user.js

pnpm test             # Run all tests (vitest + jsdom)
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report

pnpm lint:check       # ESLint check
pnpm lint             # ESLint with auto-fix
pnpm type-check       # TypeScript check (tsc --noEmit) — must pass before publish
pnpm check-all        # type-check + lint:check + test
```

## Source Structure

```
src/
├── main.ts                      # Bootstrap: auto-discovers features via import.meta.glob
├── core/
│   ├── lifecycle.ts             # LifecycleEvent enum + raiseLifecycleEvent()
│   ├── logger.ts                # Structured logger with [Hpoi Helper] prefix
│   ├── observer.ts              # onUrlChange() — detects pushState/popstate navigation
│   ├── spin-query.ts            # spinQuery() / spinQueryAll() — async DOM polling
│   ├── style.ts                 # addStyle(css, id?) / removeStyle(id) — CSS injection
│   ├── settings/
│   │   ├── index.ts             # settings.get/set/onChange/getComponent
│   │   ├── storage.ts           # GM_getValue/GM_setValue adapter
│   │   └── types.ts             # Settings, ComponentSettings, OptionsSchema types
│   └── utils/
│       ├── index.ts             # dq() / dqa() / matchCurrentUrl()
│       ├── urls.ts              # urlPatterns for hpoi.net page types
│       └── constants.ts         # SCRIPT_NAME, LOG_PREFIX, STORAGE_KEY_PREFIX, VERSION
├── components/
│   ├── define.ts                # defineComponent<S>() — type-safe metadata helper
│   ├── types.ts                 # ComponentMetadata, TestPattern, alwaysOn flag
│   ├── tags.ts                  # componentTags — display/utility/style/data
│   └── loader.ts                # registerComponents, loadAllComponents, enable/disable
├── ui/
│   └── settings-panel.ts        # Floating ⚙ button + Shadow DOM settings panel
└── features/
    ├── block-noise/index.ts     # Blocks ads and noise on homepage and hobby pages
    └── custom-browse/index.ts   # Remembers archive filter settings across visits
```

## Settings UI

`src/ui/settings-panel.ts` — floating ⚙ button (bottom-right, Shadow DOM isolated). Components with `alwaysOn: true` skip the component-level enable toggle and show only sub-options.

## Implemented Features

### `blockNoise` — 屏蔽噪音内容

**File:** `src/features/block-noise/index.ts`  |  **Pages:** `/user/home`, `/hobby/*`, `/charactar/*`, `/company/*`, `/series/*`, `/works/*`  |  `alwaysOn: true`

Eleven boolean options (all default `false`). CSS injection for eight (`blockRightAdBanner`, `blockRightRanking`, `blockRightHotRecommend`, `blockLeftPraiseRanking`, `blockHobbyTopBanner`, `blockCompanyOfficialMerch`, `blockSeriesOfficialMerch`, `blockWorksRelatedProducts`). DOM-based hiding via `createDomHider` for three:
- `blockLeftShopRecommend` — locates `#taobao-more` → `.hpoi-home-box-lt` (CSS `:has()` can't distinguish it from `待补款`)
- `blockItemRelatedProducts` — locates `.hpoi-taobao-box` → `.hpoi-box`, scoped to `/hobby/\d+`
- `blockCharRelatedProducts` — locates `.taobao-relate-swiper` → `.charactar-ibox`, scoped to `/charactar/\d+`

When all three right-column options are true, middle feed expands from 50% → 75%.

### `customBrowse` — 自定义浏览

**File:** `src/features/custom-browse/index.ts`  |  **Pages:** all  |  `alwaysOn: true`

Two boolean options (both default `false`). When on `/hobby/all`, checks URL params and calls `location.replace()` to add missing ones — a single redirect per visit, idempotent (no redirect if params already correct):
- `unlockR18`: ensures `r18=-1` is present
- `femaleOnly`: ensures `sex=0` is present

Also re-applies on SPA navigation (`onUrlChange`) and when options are toggled in the settings panel (`settings.onChange`).

## Adding a Feature Component

Create `src/features/{name}/index.ts` exporting a named `component`:

```typescript
import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'

export const component = defineComponent({
  name: 'myFeature',
  displayName: '我的功能',
  tags: [componentTags.utility],
  enabledByDefault: false,
  options: {
    limit: { defaultValue: 10 as number, displayName: '数量限制' },
  },
  entry: ({ options }) => { /* called once when enabled */ },
  unload: () => { /* cleanup */ },
})
```

`import.meta.glob` in `main.ts` discovers all `src/features/*/index.ts` — no registration needed.

## Key Conventions

- DOM queries: `dq()` / `dqa()` synchronous; `spinQuery()` for dynamic content
- Settings: `settings.onChange(path, fn)` returns unsubscribe — always call in `unload`
- Style injection: `addStyle(css, id)` paired with `removeStyle(id)` in `unload`
- Option defaults: use `false as boolean` (not literal `false`) for correct TypeScript inference
- Lifecycle hooks that may return void: wrap with `Promise.resolve(fn()).catch(...)` in loader
- Tests: vitest + jsdom; stub GM APIs with `vi.stubGlobal`; `vi.resetModules()` between tests; use `ALL_OFF` spread to keep test options concise
- `alwaysOn: true` on a component hides the master toggle in the settings panel
- DOM hiding: use `createDomHider(finder)` — returns `{ apply(hide), reset() }` with built-in caching; group hiders in a tuple for uniform cleanup in `removeAllStyles`
