import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'
import { settings } from '../../core/settings'
import { onUrlChange } from '../../core/observer'
import type { OptionsSchema } from '../../components/types'

// ---------------------------------------------------------------------------
// Option schema
// ---------------------------------------------------------------------------

const schema = {
  unlockR18: {
    defaultValue: false as boolean,
    displayName: '不限年龄',
    description: '进入资料库时自动添加 r18=-1，显示所有年龄段商品',
  },
  femaleOnly: {
    defaultValue: false as boolean,
    displayName: '只看妹子',
    description: '进入资料库时自动添加 sex=0，只显示女性角色商品',
  },
} satisfies OptionsSchema

type Opts = { [K in keyof typeof schema]: boolean }

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

const ARCHIVE_RE = /^\/hobby\/all/

function applyArchiveParams(opts: Opts): void {
  if (!ARCHIVE_RE.test(location.pathname)) return

  const params = new URLSearchParams(location.search)
  let changed = false

  if (opts.unlockR18 && params.get('r18') !== '-1') {
    params.set('r18', '-1')
    changed = true
  }
  if (opts.femaleOnly && params.get('sex') !== '0') {
    params.set('sex', '0')
    changed = true
  }

  if (changed) {
    location.replace(`${location.pathname}?${params.toString()}`)
  }
}

function getCurrentOpts(): Opts {
  const { options } = settings.getComponent<typeof schema>('customBrowse', schema)
  return options as Opts
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
  alwaysOn: true,

  options: schema,

  entry: ({ options }) => {
    applyArchiveParams(options as Opts)

    cleanups.push(
      onUrlChange(() => applyArchiveParams(getCurrentOpts())),
      ...Object.keys(schema).map((key) =>
        settings.onChange(`components.customBrowse.options.${key}`, () =>
          applyArchiveParams(getCurrentOpts()),
        ),
      ),
    )
  },

  unload: () => {
    for (const fn of cleanups) fn()
    cleanups = []
  },
})
