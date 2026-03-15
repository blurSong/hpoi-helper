import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'
import { settings } from '../../core/settings'
import { onUrlChange } from '../../core/observer'
import { dqa } from '../../core/utils'

// Settings path for persisting the saved query string (not a user-visible option)
const SAVED_QUERY_PATH = 'rememberFilter.savedQuery'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Main-category codes used by the site's standard nav links */
const MAIN_CATEGORIES = new Set(['100', '200', '300', '400', '500'])

/**
 * Returns true when the URL is the site's bare default archive link —
 * e.g. "?order=add&category=100".  We skip saving these to avoid
 * overwriting real preferences when the user arrives via a default link.
 */
function isDefaultArchiveUrl(search: string): boolean {
  if (!search || search === '?') return true
  const params = new URLSearchParams(search.replace(/^\?/, ''))
  // Ignore empty / "undefined" values injected by the page's JS
  const meaningful = [...params.entries()].filter(([, v]) => v !== '' && v !== 'undefined')
  // Default = exactly {order: "add", category: <main category>}, nothing else
  return (
    meaningful.length === 2 &&
    params.get('order') === 'add' &&
    MAIN_CATEGORIES.has(params.get('category') ?? '')
  )
}

/** Persist the current archive page's query string if it looks like a real filter */
function maybeSave(): void {
  if (isDefaultArchiveUrl(location.search)) return
  settings.set(SAVED_QUERY_PATH, location.search)
}

/**
 * Find every <a> linking to the hobby archive and rewrite its href
 * so it points to the user's saved filters instead of the default.
 */
function patchLinks(): void {
  const saved = settings.get<string>(SAVED_QUERY_PATH)
  if (!saved) return

  for (const a of dqa<HTMLAnchorElement>('a[href*="hobby/all"]')) {
    try {
      // Use getAttribute to get the raw href value (avoids browser/jsdom origin resolution)
      const raw = a.getAttribute('href') ?? ''
      const u = new URL(raw, location.origin)
      if (u.pathname.endsWith('/hobby/all')) {
        a.setAttribute('href', u.pathname + saved)
      }
    } catch {
      // ignore malformed hrefs
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let cleanups: Array<() => void> = []

export const component = defineComponent({
  name: 'rememberFilter',
  displayName: '记住资料库筛选项',
  description: '进入资料库时自动恢复上次使用的筛选条件',
  tags: [componentTags.utility],
  enabledByDefault: true,

  entry: () => {
    const onArchivePage = /\/hobby\/all\b/.test(location.pathname)

    // ── On the archive page: save filter state ──────────────────────────────
    if (onArchivePage) {
      maybeSave()

      // Also catch pushState-based URL changes (in case hpoi ever goes SPA)
      cleanups.push(
        onUrlChange((url) => {
          if (/\/hobby\/all\b/.test(new URL(url).pathname)) maybeSave()
        }),
      )
    }

    // ── On every page: rewrite archive entry links ───────────────────────────
    patchLinks()

    // Re-patch after any URL change (covers SPA navigation adding new links)
    cleanups.push(onUrlChange(() => patchLinks()))
  },

  unload: () => {
    for (const fn of cleanups) fn()
    cleanups = []
  },
})
