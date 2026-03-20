import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.stubGlobal('GM_getValue', vi.fn(() => undefined))
vi.stubGlobal('GM_setValue', vi.fn())
vi.stubGlobal('GM_deleteValue', vi.fn())
vi.stubGlobal('GM_addStyle', undefined)

// Each test gets a fresh module state
async function load(url = 'https://www.hpoi.net/user/home') {
  vi.resetModules()
  const u = new URL(url)
  vi.stubGlobal('location', { href: url, pathname: u.pathname, search: u.search, origin: u.origin })
  const mod = await import('../../src/features/block-noise')
  return mod.component
}

/** Count <style> tags in document.head with a given data attribute */
function styleCount(id: string): number {
  return document.head.querySelectorAll(`[data-hpoi-style="${id}"]`).length
}

/** All options set to false (default state) */
const ALL_OFF = {
  blockRightAdBanner: false,
  blockRightRanking: false,
  blockRightHotRecommend: false,
  blockLeftShopRecommend: false,
  blockLeftPraiseRanking: false,
  blockHobbyTopBanner: false,
  blockItemRelatedProducts: false,
  blockCharRelatedProducts: false,
  blockCompanyOfficialMerch: false,
}

/** Build a minimal DOM mimicking the item page's 关联商品 structure */
function setupTaobaoBoxDom(): HTMLElement {
  const box = document.createElement('div')
  box.className = 'hpoi-box'
  const taobao = document.createElement('div')
  taobao.className = 'hpoi-taobao-box row'
  box.appendChild(taobao)
  document.body.appendChild(box)
  return box
}

/** Build a minimal DOM mimicking the character page's 相关商品 structure */
function setupCharPageDom(): HTMLElement {
  const box = document.createElement('div')
  box.className = 'charactar-ibox'
  const body = document.createElement('div')
  body.className = 'charactar-ibox-body'
  const swiper = document.createElement('div')
  swiper.className = 'swiper-container taobao-relate-swiper'
  body.appendChild(swiper)
  box.appendChild(body)
  document.body.appendChild(box)
  return box
}

describe('block-noise — homepage', () => {
  beforeEach(() => {
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    document.head.innerHTML = ''
  })
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('injects no styles when all options are false (default)', async () => {
    const c = await load()
    await c.entry!({ options: { ...ALL_OFF }, enabled: true })
    expect(document.head.querySelectorAll('style').length).toBe(0)
  })

  it('injects right-ad style when blockRightAdBanner is true', async () => {
    const c = await load()
    await c.entry!({ options: { ...ALL_OFF, blockRightAdBanner: true }, enabled: true })
    expect(styleCount('bn-right-ad')).toBe(1)
    expect(styleCount('bn-layout-expand')).toBe(0) // not all right-col blocked
  })

  it('injects layout-expand when all three right-column options are true', async () => {
    const c = await load()
    await c.entry!({ options: {
      ...ALL_OFF,
      blockRightAdBanner: true,
      blockRightRanking: true,
      blockRightHotRecommend: true,
    }, enabled: true })
    expect(styleCount('bn-right-ad')).toBe(1)
    expect(styleCount('bn-right-ranking')).toBe(1)
    expect(styleCount('bn-right-hot')).toBe(1)
    expect(styleCount('bn-layout-expand')).toBe(1)
  })

  it('does NOT inject layout-expand when only two right-column options are true', async () => {
    const c = await load()
    await c.entry!({ options: {
      ...ALL_OFF,
      blockRightAdBanner: true,
      blockRightRanking: true,
    }, enabled: true })
    expect(styleCount('bn-layout-expand')).toBe(0)
  })

  it('removes all injected styles on unload', async () => {
    const c = await load()
    await c.entry!({ options: {
      ...ALL_OFF,
      blockRightAdBanner: true,
      blockRightRanking: true,
      blockRightHotRecommend: true,
      blockLeftShopRecommend: true,
      blockLeftPraiseRanking: true,
    }, enabled: true })
    expect(document.head.querySelectorAll('style').length).toBeGreaterThan(0)

    await c.unload!()
    expect(document.head.querySelectorAll('style').length).toBe(0)
  })
})

describe('block-noise — hobby page', () => {
  beforeEach(() => {
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    document.head.innerHTML = ''
  })
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('injects hobby banner style when blockHobbyTopBanner is true', async () => {
    const c = await load('https://www.hpoi.net/hobby/')
    await c.entry!({ options: { ...ALL_OFF, blockHobbyTopBanner: true }, enabled: true })
    expect(styleCount('bn-hobby-top')).toBe(1)
  })

  it('targets the correct selector for hobby banner', async () => {
    const c = await load('https://www.hpoi.net/hobby/')
    await c.entry!({ options: { ...ALL_OFF, blockHobbyTopBanner: true }, enabled: true })
    const styleEl = document.head.querySelector('[data-hpoi-style="bn-hobby-top"]')
    expect(styleEl?.textContent).toContain('.hpoi-topcarousel-box')
    expect(styleEl?.textContent).toContain('display: none')
  })
})

describe('block-noise — item page (关联商品)', () => {
  beforeEach(() => {
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })
  afterEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('hides entire .hpoi-box container on item page when enabled', async () => {
    const box = setupTaobaoBoxDom()
    const c = await load('https://www.hpoi.net/hobby/120928')
    await c.entry!({ options: { ...ALL_OFF, blockItemRelatedProducts: true }, enabled: true })
    expect(box.style.display).toBe('none')
  })

  it('does NOT hide on homepage even when enabled', async () => {
    const box = setupTaobaoBoxDom()
    const c = await load('https://www.hpoi.net/user/home')
    await c.entry!({ options: { ...ALL_OFF, blockItemRelatedProducts: true }, enabled: true })
    expect(box.style.display).not.toBe('none')
  })

  it('does NOT hide on archive page', async () => {
    const box = setupTaobaoBoxDom()
    const c = await load('https://www.hpoi.net/hobby/all')
    await c.entry!({ options: { ...ALL_OFF, blockItemRelatedProducts: true }, enabled: true })
    expect(box.style.display).not.toBe('none')
  })

  it('restores display on unload', async () => {
    const box = setupTaobaoBoxDom()
    const c = await load('https://www.hpoi.net/hobby/120928')
    await c.entry!({ options: { ...ALL_OFF, blockItemRelatedProducts: true }, enabled: true })
    expect(box.style.display).toBe('none')
    await c.unload!()
    expect(box.style.display).toBe('')
  })
})

describe('block-noise — character page (相关商品)', () => {
  beforeEach(() => {
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })
  afterEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('hides entire .charactar-ibox container on character page when enabled', async () => {
    const box = setupCharPageDom()
    const c = await load('https://www.hpoi.net/charactar/262')
    await c.entry!({ options: { ...ALL_OFF, blockCharRelatedProducts: true }, enabled: true })
    expect(box.style.display).toBe('none')
  })

  it('does NOT hide on homepage even when enabled', async () => {
    const box = setupCharPageDom()
    const c = await load('https://www.hpoi.net/user/home')
    await c.entry!({ options: { ...ALL_OFF, blockCharRelatedProducts: true }, enabled: true })
    expect(box.style.display).not.toBe('none')
  })

  it('does NOT hide on item page', async () => {
    const box = setupCharPageDom()
    const c = await load('https://www.hpoi.net/hobby/120928')
    await c.entry!({ options: { ...ALL_OFF, blockCharRelatedProducts: true }, enabled: true })
    expect(box.style.display).not.toBe('none')
  })

  it('restores display on unload', async () => {
    const box = setupCharPageDom()
    const c = await load('https://www.hpoi.net/charactar/262')
    await c.entry!({ options: { ...ALL_OFF, blockCharRelatedProducts: true }, enabled: true })
    expect(box.style.display).toBe('none')
    await c.unload!()
    expect(box.style.display).toBe('')
  })
})

describe('block-noise — company page (自营周边)', () => {
  beforeEach(() => {
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    document.head.innerHTML = ''
  })
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('injects CSS for .company-container-shop-hobby when enabled', async () => {
    const c = await load('https://www.hpoi.net/company/259')
    await c.entry!({ options: { ...ALL_OFF, blockCompanyOfficialMerch: true }, enabled: true })
    expect(styleCount('bn-company-shop')).toBe(1)
    const styleEl = document.head.querySelector('[data-hpoi-style="bn-company-shop"]')
    expect(styleEl?.textContent).toContain('.company-container-shop-hobby')
  })

  it('does not inject CSS when disabled', async () => {
    const c = await load('https://www.hpoi.net/company/259')
    await c.entry!({ options: { ...ALL_OFF, blockCompanyOfficialMerch: false }, enabled: true })
    expect(styleCount('bn-company-shop')).toBe(0)
  })

  it('removes CSS on unload', async () => {
    const c = await load('https://www.hpoi.net/company/259')
    await c.entry!({ options: { ...ALL_OFF, blockCompanyOfficialMerch: true }, enabled: true })
    expect(styleCount('bn-company-shop')).toBe(1)
    await c.unload!()
    expect(styleCount('bn-company-shop')).toBe(0)
  })
})
