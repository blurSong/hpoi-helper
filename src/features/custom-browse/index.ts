import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'
import { settings } from '../../core/settings'
import { onUrlChange } from '../../core/observer'
import { dqa } from '../../core/utils'
import type { OptionsSchema } from '../../components/types'

// Kept stable so previously saved filter preferences are not lost
const SAVED_QUERY_PATH = 'rememberFilter.savedQuery'

// ---------------------------------------------------------------------------
// Option schema
// ---------------------------------------------------------------------------

const schema = {
  rememberFilter: {
    defaultValue: true as boolean,
    displayName: '记住资料库筛选项',
    description: '进入资料库时自动恢复上次使用的筛选条件',
  },
} satisfies OptionsSchema

type Opts = { [K in keyof typeof schema]: boolean }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAIN_CATEGORIES = new Set(['100', '200', '300', '400', '500'])

function isDefaultArchiveUrl(search: string): boolean {
  if (!search || search === '?') return true
  const params = new URLSearchParams(search.replace(/^\?/, ''))
  const meaningful = [...params.entries()].filter(([, v]) => v !== '' && v !== 'undefined')
  return (
    meaningful.length === 2 &&
    params.get('order') === 'add' &&
    MAIN_CATEGORIES.has(params.get('category') ?? '')
  )
}

function maybeSave(): void {
  if (isDefaultArchiveUrl(location.search)) return
  settings.set(SAVED_QUERY_PATH, location.search)
}

const patchedLinks = new Map<HTMLAnchorElement, string>()

function patchLinks(): void {
  const saved = settings.get<string>(SAVED_QUERY_PATH)
  if (!saved) return

  for (const a of dqa<HTMLAnchorElement>('a[href*="hobby/all"]')) {
    try {
      const raw = a.getAttribute('href') ?? ''
      const u = new URL(raw, location.origin)
      if (!u.pathname.endsWith('/hobby/all')) continue
      if (!patchedLinks.has(a)) patchedLinks.set(a, raw)
      a.setAttribute('href', u.pathname + saved)
    } catch {
      // ignore malformed hrefs
    }
  }
}

function restoreLinks(): void {
  for (const [a, original] of patchedLinks) a.setAttribute('href', original)
  patchedLinks.clear()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let cleanups: Array<() => void> = []

export const component = defineComponent({
  name: 'customBrowse',
  displayName: '自定义浏览',
  description: '自定义资料库的浏览行为',
  tags: [componentTags.utility],
  enabledByDefault: true,

  options: schema,

  entry: ({ options }) => {
    const opts = options as Opts
    const onArchivePage = /\/hobby\/all\b/.test(location.pathname)

    if (opts.rememberFilter) {
      if (onArchivePage) {
        maybeSave()
        cleanups.push(
          onUrlChange((url) => {
            if (/\/hobby\/all\b/.test(new URL(url).pathname)) maybeSave()
          }),
        )
      }
      patchLinks()
      cleanups.push(onUrlChange(() => patchLinks()))
    }

    // Re-apply when option is toggled in the settings panel
    cleanups.push(
      settings.onChange('components.customBrowse.options.rememberFilter', () => {
        const { options: current } = settings.getComponent<typeof schema>('customBrowse', schema)
        restoreLinks()
        if ((current as Opts).rememberFilter) patchLinks()
      }),
    )
  },

  unload: () => {
    restoreLinks()
    for (const fn of cleanups) fn()
    cleanups = []
  },
})
