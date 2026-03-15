import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.stubGlobal('GM_getValue', vi.fn(() => undefined))
vi.stubGlobal('GM_setValue', vi.fn())
vi.stubGlobal('GM_deleteValue', vi.fn())

const load = async (href: string) => {
  vi.resetModules()
  vi.mocked(GM_getValue).mockReturnValue(undefined)
  vi.stubGlobal('location', { href, pathname: new URL(href).pathname, search: new URL(href).search })
  const mod = await import('../../src/features/remember-filter')
  return mod.component
}

const getSaved = async (): Promise<string | undefined> => {
  vi.resetModules()
  const { settings } = await import('../../src/core/settings')
  return settings.get<string>('rememberFilter.savedQuery')
}

describe('isDefaultArchiveUrl detection', () => {
  beforeEach(() => vi.mocked(GM_setValue).mockClear())

  it('does NOT save bare default URL', async () => {
    await (await load('https://www.hpoi.net/hobby/all?order=add&category=100')).entry!({ options: {}, enabled: true })
    expect(vi.mocked(GM_setValue)).not.toHaveBeenCalled()
  })

  it('saves when order differs from default', async () => {
    await (await load('https://www.hpoi.net/hobby/all?order=hits&category=100')).entry!({ options: {}, enabled: true })
    expect(vi.mocked(GM_setValue)).toHaveBeenCalled()
  })

  it('saves when additional filter params are present', async () => {
    await (await load('https://www.hpoi.net/hobby/all?order=hits&sex=0&r18=199&category=1')).entry!({ options: {}, enabled: true })
    expect(vi.mocked(GM_setValue)).toHaveBeenCalled()
  })

  it('saves when sub-category differs from main default', async () => {
    // category=1 (比例人形) is a user choice, not the bare default
    await (await load('https://www.hpoi.net/hobby/all?order=add&category=1')).entry!({ options: {}, enabled: true })
    expect(vi.mocked(GM_setValue)).toHaveBeenCalled()
  })

  it('treats "?order=add&category=100&workers=&state=undefined" as default (empty/undefined params ignored)', async () => {
    await (await load('https://www.hpoi.net/hobby/all?order=add&category=100&workers=&state=undefined')).entry!({ options: {}, enabled: true })
    expect(vi.mocked(GM_setValue)).not.toHaveBeenCalled()
  })
})

describe('link patching', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('patches archive links with saved query', async () => {
    const SAVED = '?order=hits&sex=0&r18=199&category=1'

    vi.resetModules()
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    vi.stubGlobal('location', {
      href: 'https://www.hpoi.net/hobby/',
      pathname: '/hobby/',
      search: '',
      origin: 'https://www.hpoi.net',
    })

    // Import both modules from the same fresh cache so they share the same _settings instance
    const { settings } = await import('../../src/core/settings')
    const { component } = await import('../../src/features/remember-filter')

    // Seed the saved query directly into the live settings object
    settings.set('rememberFilter.savedQuery', SAVED)

    const link = document.createElement('a')
    link.setAttribute('href', '/hobby/all?order=add&category=100')
    document.body.appendChild(link)

    await component.entry!({ options: {}, enabled: true })

    expect(link.getAttribute('href')).toBe('/hobby/all' + SAVED)
  })

  it('leaves links unchanged when no saved query', async () => {
    vi.resetModules()
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    vi.stubGlobal('location', {
      href: 'https://www.hpoi.net/hobby/',
      pathname: '/hobby/',
      search: '',
    })

    const link = document.createElement('a')
    link.setAttribute('href', '/hobby/all?order=add&category=100')
    document.body.appendChild(link)

    const { component } = await import('../../src/features/remember-filter')
    await component.entry!({ options: {}, enabled: true })

    expect(link.getAttribute('href')).toBe('/hobby/all?order=add&category=100')
  })
})
