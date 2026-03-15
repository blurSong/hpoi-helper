import { defineComponent } from '../../components/define'
import { componentTags } from '../../components/tags'
import { addStyle, removeStyle } from '../../core/style'
import { settings } from '../../core/settings'
import { dq } from '../../core/utils'
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
// CSS rules for options that can be targeted unambiguously
// ---------------------------------------------------------------------------

// blockLeftShopRecommend is intentionally absent here — see DOM approach below.
// CSS :has() selectors still hit 待补款 (which also renders .hpoi-taobao-box
// items), so we locate 商品推荐 by its unique #taobao-more anchor instead.
const CSS_RULES: Partial<Record<keyof Opts, { id: string; css: string }>> = {
  blockRightAdBanner: {
    id: 'bn-right-ad',
    css: `.swiper-container.swiper-home, .hpoi-home-img-box { display: none !important; }`,
  },
  blockRightRanking: {
    id: 'bn-right-ranking',
    css: `.hpoi-home-box-rt:not(.home-article) { display: none !important; }`,
  },
  blockRightHotRecommend: {
    id: 'bn-right-hot',
    css: `.hpoi-home-box-rt.home-article { display: none !important; }`,
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
  .home-right { display: none !important; }
  .container.user-home > .row > .col-sm-12 {
    width: 75% !important;
    flex: 0 0 75% !important;
    max-width: 75% !important;
  }
`

// ---------------------------------------------------------------------------
// DOM-based hiding for 商品推荐
// (CSS selectors cannot reliably distinguish it from 待补款/关注动态)
// ---------------------------------------------------------------------------

/** The 商品推荐 box element, cached after first lookup */
let shopBox: HTMLElement | null = null

function findShopBox(): HTMLElement | null {
  if (shopBox) return shopBox
  // #taobao-more is the "更多" link unique to 商品推荐
  shopBox = dq<HTMLElement>('#taobao-more')?.closest<HTMLElement>('.hpoi-home-box-lt') ?? null
  return shopBox
}

function applyShopRecommend(hide: boolean): void {
  const el = findShopBox()
  if (!el) return
  if (hide) {
    el.style.setProperty('display', 'none', 'important')
  } else {
    el.style.removeProperty('display')
  }
}

// ---------------------------------------------------------------------------
// Apply / remove helpers
// ---------------------------------------------------------------------------

function applyStyles(opts: Opts) {
  for (const key of Object.keys(CSS_RULES) as Array<keyof typeof CSS_RULES>) {
    const rule = CSS_RULES[key]!
    if (opts[key]) {
      addStyle(rule.css, rule.id)
    } else {
      removeStyle(rule.id)
    }
  }

  applyShopRecommend(opts.blockLeftShopRecommend)

  // Expand the middle column only when the entire right column is gone
  if (opts.blockRightAdBanner && opts.blockRightRanking && opts.blockRightHotRecommend) {
    addStyle(EXPAND_CSS, EXPAND_ID)
  } else {
    removeStyle(EXPAND_ID)
  }
}

function removeAllStyles() {
  for (const rule of Object.values(CSS_RULES)) removeStyle(rule!.id)
  removeStyle(EXPAND_ID)
  applyShopRecommend(false)
  shopBox = null
}

// ---------------------------------------------------------------------------
// Module-level cleanup handles
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

  urlInclude: [/hpoi\.net\/user\/home/, /hpoi\.net\/hobby/],

  options: schema,

  entry: ({ options }) => {
    applyStyles(options as Opts)

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
