import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'
import { addStyle, removeStyle } from '../../core/style'
import { settings } from '../../core/settings'
import type { OptionsSchema } from '../../components/types'

// ---------------------------------------------------------------------------
// Option schema
// ---------------------------------------------------------------------------

const schema = {
  blockRightAdBanner: {
    defaultValue: false as boolean,
    displayName: '【首页】屏蔽右栏广告 banner',
    description: '隐藏右栏的广告轮播及快捷入口图片（相册/论坛/二手专区按钮）',
  },
  blockRightRanking: {
    defaultValue: false as boolean,
    displayName: '【首页】屏蔽右栏近期发售榜',
    description: '隐藏右栏的「近期发售」/「周边期待榜」列表',
  },
  blockRightHotRecommend: {
    defaultValue: false as boolean,
    displayName: '【首页】屏蔽右栏热门推荐',
    description: '隐藏右栏的热门推荐文章列表',
  },
  blockLeftShopRecommend: {
    defaultValue: false as boolean,
    displayName: '【首页】屏蔽左栏商品推荐',
    description: '隐藏左栏的淘宝自营商品推荐区',
  },
  blockLeftPraiseRanking: {
    defaultValue: false as boolean,
    displayName: '【首页】屏蔽左栏获赞排行榜',
    description: '隐藏左栏的获赞排行榜',
  },
  blockHobbyTopBanner: {
    defaultValue: false as boolean,
    displayName: '【手办页】屏蔽顶部广告区',
    description: '隐藏手办分区首页顶部的活动轮播和自营店广告图',
  },
} satisfies OptionsSchema

type Opts = { [K in keyof typeof schema]: boolean }

// ---------------------------------------------------------------------------
// CSS rules — one entry per option
// ---------------------------------------------------------------------------

const RULES: Record<keyof Opts, { id: string; css: string }> = {
  blockRightAdBanner: {
    id: 'bn-right-ad',
    css: `.swiper-container.swiper-home, .hpoi-home-img-box { display: none !important; }`,
  },
  blockRightRanking: {
    id: 'bn-right-ranking',
    // The ranking box is the first .hpoi-home-box-rt; the hot-recommend box also has .home-article
    css: `.hpoi-home-box-rt:not(.home-article) { display: none !important; }`,
  },
  blockRightHotRecommend: {
    id: 'bn-right-hot',
    css: `.hpoi-home-box-rt.home-article { display: none !important; }`,
  },
  blockLeftShopRecommend: {
    id: 'bn-left-shop',
    // Use :has(.hpoi-taobao-box) to target only the 商品推荐 box.
    // Other .hpoi-home-box-lt sections (关注动态, 待补款) do NOT contain .hpoi-taobao-box.
    css: `.hpoi-home-box-lt:has(.hpoi-taobao-box) { display: none !important; }`,
  },
  blockLeftPraiseRanking: {
    id: 'bn-left-praise',
    css: `.hpoi-home-box-lt.top-praise { display: none !important; }`,
  },
  blockHobbyTopBanner: {
    id: 'bn-hobby-top',
    css: `.hpoi-topcarousel-box { display: none !important; }`,
  },
}

// Applied when ALL three right-column sections are blocked
const EXPAND_ID = 'bn-layout-expand'
const EXPAND_CSS = `
  /* Hide the now-empty right column */
  .home-right { display: none !important; }

  /* Expand middle feed from 50% to 75% in the 24-column grid */
  .container.user-home > .row > .col-sm-12 {
    width: 75% !important;
    flex: 0 0 75% !important;
    max-width: 75% !important;
  }
`

// ---------------------------------------------------------------------------
// Apply / remove helpers
// ---------------------------------------------------------------------------

function applyStyles(opts: Opts) {
  for (const [key, { id, css }] of Object.entries(RULES) as Array<[keyof Opts, (typeof RULES)[keyof Opts]]>) {
    if (opts[key]) {
      addStyle(css, id)
    } else {
      removeStyle(id)
    }
  }

  // Expand the middle column only when the entire right column is empty
  if (opts.blockRightAdBanner && opts.blockRightRanking && opts.blockRightHotRecommend) {
    addStyle(EXPAND_CSS, EXPAND_ID)
  } else {
    removeStyle(EXPAND_ID)
  }
}

function removeAllStyles() {
  for (const { id } of Object.values(RULES)) removeStyle(id)
  removeStyle(EXPAND_ID)
}

// ---------------------------------------------------------------------------
// Module-level cleanup handles (populated on entry, cleared on unload)
// ---------------------------------------------------------------------------

let cleanups: Array<() => void> = []

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const component = defineComponent({
  name: 'blockNoise',
  displayName: '屏蔽噪音内容',
  description: '分别屏蔽首页和手办页的广告、推荐、排行榜等干扰内容',
  tags: [componentTags.display],
  enabledByDefault: false,

  // Run on both the user home page and all hobby section pages
  urlInclude: [/hpoi\.net\/user\/home/, /hpoi\.net\/hobby/],

  options: schema,

  entry: ({ options }) => {
    applyStyles(options as Opts)

    // Re-apply whenever any individual option is toggled in the settings UI
    cleanups = (Object.keys(schema) as Array<keyof Opts>).map((key) =>
      settings.onChange(`components.blockNoise.options.${key}`, () => {
        const { options: current } = settings.getComponent<typeof schema>('blockNoise', schema)
        applyStyles(current as Opts)
      }),
    )
  },

  reload: () => {
    const { options } = settings.getComponent<typeof schema>('blockNoise', schema)
    applyStyles(options as Opts)
  },

  unload: () => {
    removeAllStyles()
    for (const fn of cleanups) fn()
    cleanups = []
  },
})
