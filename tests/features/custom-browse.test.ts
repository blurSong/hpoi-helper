import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.stubGlobal('GM_getValue', vi.fn(() => undefined))
vi.stubGlobal('GM_setValue', vi.fn())
vi.stubGlobal('GM_deleteValue', vi.fn())

const OPTS_ON  = { rememberFilter: true }
const OPTS_OFF = { rememberFilter: false }

const load = async (href: string, opts = OPTS_ON) => {
  vi.resetModules()
  vi.mocked(GM_getValue).mockReturnValue(undefined)
  vi.stubGlobal('location', {
    href,
    pathname: new URL(href).pathname,
    search:   new URL(href).search,
    origin:   new URL(href).origin,
  })
  const { component } = await import('../../src/features/custom-browse')
  return { run: () => component.entry!({ options: opts, enabled: true }), component }
}

// ---------------------------------------------------------------------------
// Save logic
// ---------------------------------------------------------------------------

describe('rememberFilter — save logic', () => {
  beforeEach(() => vi.mocked(GM_setValue).mockClear())

  it('does NOT save bare default URL', async () => {
    const { run } = await load('https://www.hpoi.net/hobby/all?order=add&category=100')
    await run()
    expect(vi.mocked(GM_setValue)).not.toHaveBeenCalled()
  })

  it('saves URL with real user filters', async () => {
    const { run } = await load('https://www.hpoi.net/hobby/all?order=hits&sex=0&r18=199&category=1')
    await run()
    expect(vi.mocked(GM_setValue)).toHaveBeenCalled()
  })

  it('saves sub-category change (category=1 is a user choice)', async () => {
    const { run } = await load('https://www.hpoi.net/hobby/all?order=add&category=1')
    await run()
    expect(vi.mocked(GM_setValue)).toHaveBeenCalled()
  })

  it('treats empty/undefined params as default', async () => {
    const { run } = await load('https://www.hpoi.net/hobby/all?order=add&category=100&workers=&state=undefined')
    await run()
    expect(vi.mocked(GM_setValue)).not.toHaveBeenCalled()
  })

  it('does nothing when rememberFilter option is off', async () => {
    const { run } = await load('https://www.hpoi.net/hobby/all?order=hits&category=1', OPTS_OFF)
    await run()
    expect(vi.mocked(GM_setValue)).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Link patching & restoration
// ---------------------------------------------------------------------------

describe('rememberFilter — link patching', () => {
  beforeEach(() => { document.body.innerHTML = '' })

  it('patches archive links with saved query', async () => {
    const SAVED = '?order=hits&sex=0&r18=199&category=1'

    vi.resetModules()
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    vi.stubGlobal('location', {
      href: 'https://www.hpoi.net/hobby/', pathname: '/hobby/', search: '', origin: 'https://www.hpoi.net',
    })

    const { settings } = await import('../../src/core/settings')
    const { component } = await import('../../src/features/custom-browse')
    settings.set('rememberFilter.savedQuery', SAVED)

    const link = document.createElement('a')
    link.setAttribute('href', '/hobby/all?order=add&category=100')
    document.body.appendChild(link)

    await component.entry!({ options: OPTS_ON, enabled: true })
    expect(link.getAttribute('href')).toBe('/hobby/all' + SAVED)
  })

  it('leaves links unchanged when option is off', async () => {
    vi.resetModules()
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    vi.stubGlobal('location', {
      href: 'https://www.hpoi.net/hobby/', pathname: '/hobby/', search: '', origin: 'https://www.hpoi.net',
    })

    const { settings } = await import('../../src/core/settings')
    const { component } = await import('../../src/features/custom-browse')
    settings.set('rememberFilter.savedQuery', '?order=hits&category=1')

    const link = document.createElement('a')
    link.setAttribute('href', '/hobby/all?order=add&category=100')
    document.body.appendChild(link)

    await component.entry!({ options: OPTS_OFF, enabled: true })
    expect(link.getAttribute('href')).toBe('/hobby/all?order=add&category=100')
  })

  it('restores original href on unload', async () => {
    const SAVED    = '?order=hits&sex=0&r18=199&category=1'
    const ORIGINAL = '/hobby/all?order=add&category=100'

    vi.resetModules()
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    vi.stubGlobal('location', {
      href: 'https://www.hpoi.net/hobby/', pathname: '/hobby/', search: '', origin: 'https://www.hpoi.net',
    })

    const { settings } = await import('../../src/core/settings')
    const { component } = await import('../../src/features/custom-browse')
    settings.set('rememberFilter.savedQuery', SAVED)

    const link = document.createElement('a')
    link.setAttribute('href', ORIGINAL)
    document.body.appendChild(link)

    await component.entry!({ options: OPTS_ON, enabled: true })
    expect(link.getAttribute('href')).toBe('/hobby/all' + SAVED)

    await component.unload!()
    expect(link.getAttribute('href')).toBe(ORIGINAL)
  })
})
