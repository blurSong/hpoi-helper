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
pnpm test:coverage    # Coverage report (80% threshold)

pnpm lint:check       # ESLint check
pnpm lint             # ESLint with auto-fix
pnpm type-check       # TypeScript check (tsc --noEmit)
pnpm check-all        # type-check + lint:check + test
```

## Source Structure

```
src/
├── main.ts                  # Bootstrap: auto-discovers features via import.meta.glob, runs lifecycle
├── core/
│   ├── core-apis.ts         # Aggregated API object (coreApis) passed to components
│   ├── lifecycle.ts         # LifecycleEvent enum + raiseLifecycleEvent()
│   ├── logger.ts            # Structured logger with [Hpoi Helper] prefix and log levels
│   ├── observer.ts          # observeChildren / observeSubtree / onUrlChange
│   ├── spin-query.ts        # spinQuery() / spinQueryAll() — async DOM polling
│   ├── style.ts             # addStyle(css, id?) / removeStyle(id) — CSS injection via GM_addStyle
│   ├── settings/
│   │   ├── index.ts         # settings.get/set/onChange/getComponent — main API
│   │   ├── storage.ts       # GM_getValue/GM_setValue adapter (falls back to defaults in tests)
│   │   └── types.ts         # Settings, ComponentSettings, OptionsSchema types
│   └── utils/
│       ├── index.ts         # dq() / dqa() / matchCurrentUrl()
│       ├── urls.ts          # urlPatterns — regex constants for hpoi.net page types
│       └── constants.ts     # SCRIPT_NAME, LOG_PREFIX, STORAGE_KEY_PREFIX, VERSION
├── components/
│   ├── define.ts            # defineComponent<S>() — type-safe metadata helper
│   ├── types.ts             # ComponentMetadata, InstantStyle, TestPattern types
│   ├── tags.ts              # componentTags — display/utility/style/data
│   └── loader.ts            # loadAllComponents(), enableComponent(), disableComponent()
├── plugins/
│   └── types.ts             # Plugin type stubs (PluginMetadata, DataProvider, HookHandlers)
└── features/
    ├── example/index.ts     # Minimal component validating the bootstrap pipeline
    └── block-noise/index.ts # Blocks ads and noise on homepage and hobby pages
```

## Implemented Features

### `block-noise` — 屏蔽噪音内容

**File:** `src/features/block-noise/index.ts`
**Pages:** `/user/home`, `/hobby/*`

Six independent boolean options, all defaulting to `false`:

| Option key | Effect |
|---|---|
| `blockRightAdBanner` | Hides homepage right-col ad carousel + image buttons |
| `blockRightRanking` | Hides homepage right-col 近期发售/周边期待榜 |
| `blockRightHotRecommend` | Hides homepage right-col 热门推荐 articles |
| `blockLeftShopRecommend` | Hides homepage left-col 商品推荐 |
| `blockLeftPraiseRanking` | Hides homepage left-col 获赞排行榜 |
| `blockHobbyTopBanner` | Hides hobby page top promo carousel + shop ad images |

When all three right-column options are `true`, the middle feed column auto-expands from 50% → 75% and the right column is hidden entirely.

Implementation: CSS injection via `addStyle()`; each option maps to a `data-hpoi-style` id so styles can be added/removed independently. Settings listeners re-apply on runtime toggle.

## Adding a Feature Component

Create `src/features/{name}/index.ts` exporting a named `component`:

```typescript
import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'

export const component = defineComponent({
  name: 'myFeature',            // unique camelCase ID
  displayName: '我的功能',
  description: 'Shown in settings UI',
  tags: [componentTags.utility],
  enabledByDefault: false,
  urlInclude: /hpoi\.net\/hobby\/(?!\d)/,  // optional page targeting
  options: {
    limit: { defaultValue: 10 as number, displayName: '数量限制' },
  },
  entry: ({ options }) => {
    // called once when enabled; options is fully typed
  },
  unload: () => { /* cleanup */ },
})
```

`import.meta.glob` in `main.ts` discovers all `src/features/*/index.ts` automatically — no registration needed.

## Key Conventions

- DOM queries: `dq()` / `dqa()` for synchronous; `spinQuery()` for elements that load dynamically
- Settings: `settings.getComponent(name, schema)` reads persisted options; `settings.onChange(path, fn)` returns an unsubscribe function — always call it in `unload`
- Style injection: use `addStyle(css, id)` with a stable `id`; pair each `addStyle` in `entry` with `removeStyle(id)` in `unload`
- Option values: use `false as boolean` (not `false`) in schema `defaultValue` to keep the TypeScript type as `boolean`, not the literal `false`
- Tests: live in `tests/`, use vitest + jsdom; stub GM APIs with `vi.stubGlobal` before importing the module under test; call `vi.resetModules()` between tests that share module state
- Plugin system: types defined in `src/plugins/types.ts`; logic not yet implemented
