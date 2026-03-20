import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.stubGlobal('GM_getValue', vi.fn(() => undefined))
vi.stubGlobal('GM_setValue', vi.fn())
vi.stubGlobal('GM_deleteValue', vi.fn())

const replaceFn = vi.fn()

function stubLocation(href: string) {
  const u = new URL(href)
  vi.stubGlobal('location', {
    href,
    pathname: u.pathname,
    search: u.search,
    origin: u.origin,
    replace: replaceFn,
  })
}

async function load(href: string) {
  vi.resetModules()
  stubLocation(href)
  const { component } = await import('../../src/features/custom-browse')
  return component
}

const ALL_OFF = { unlockR18: false, femaleOnly: false }

// ---------------------------------------------------------------------------
// unlockR18
// ---------------------------------------------------------------------------

describe('unlockR18', () => {
  beforeEach(() => replaceFn.mockClear())

  it('redirects to add r18=-1 when missing', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100')
    await c.entry!({ options: { ...ALL_OFF, unlockR18: true }, enabled: true })
    expect(replaceFn).toHaveBeenCalledOnce()
    const url = new URL(replaceFn.mock.calls[0][0], 'https://www.hpoi.net')
    expect(url.searchParams.get('r18')).toBe('-1')
  })

  it('preserves existing query params on redirect', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=hits&category=1')
    await c.entry!({ options: { ...ALL_OFF, unlockR18: true }, enabled: true })
    const url = new URL(replaceFn.mock.calls[0][0], 'https://www.hpoi.net')
    expect(url.searchParams.get('order')).toBe('hits')
    expect(url.searchParams.get('category')).toBe('1')
    expect(url.searchParams.get('r18')).toBe('-1')
  })

  it('does NOT redirect when r18=-1 already set', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100&r18=-1')
    await c.entry!({ options: { ...ALL_OFF, unlockR18: true }, enabled: true })
    expect(replaceFn).not.toHaveBeenCalled()
  })

  it('does NOT redirect when option is off', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100')
    await c.entry!({ options: ALL_OFF, enabled: true })
    expect(replaceFn).not.toHaveBeenCalled()
  })

  it('does NOT redirect on non-archive pages', async () => {
    const c = await load('https://www.hpoi.net/user/home')
    await c.entry!({ options: { ...ALL_OFF, unlockR18: true }, enabled: true })
    expect(replaceFn).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// femaleOnly
// ---------------------------------------------------------------------------

describe('femaleOnly', () => {
  beforeEach(() => replaceFn.mockClear())

  it('redirects to add sex=0 when missing', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100')
    await c.entry!({ options: { ...ALL_OFF, femaleOnly: true }, enabled: true })
    expect(replaceFn).toHaveBeenCalledOnce()
    const url = new URL(replaceFn.mock.calls[0][0], 'https://www.hpoi.net')
    expect(url.searchParams.get('sex')).toBe('0')
  })

  it('does NOT redirect when sex=0 already set', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100&sex=0')
    await c.entry!({ options: { ...ALL_OFF, femaleOnly: true }, enabled: true })
    expect(replaceFn).not.toHaveBeenCalled()
  })

  it('does NOT redirect when option is off', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100')
    await c.entry!({ options: ALL_OFF, enabled: true })
    expect(replaceFn).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// both options together
// ---------------------------------------------------------------------------

describe('unlockR18 + femaleOnly together', () => {
  beforeEach(() => replaceFn.mockClear())

  it('adds both params in a single redirect', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100')
    await c.entry!({ options: { unlockR18: true, femaleOnly: true }, enabled: true })
    expect(replaceFn).toHaveBeenCalledOnce()
    const url = new URL(replaceFn.mock.calls[0][0], 'https://www.hpoi.net')
    expect(url.searchParams.get('r18')).toBe('-1')
    expect(url.searchParams.get('sex')).toBe('0')
  })

  it('does NOT redirect when both params already set', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100&r18=-1&sex=0')
    await c.entry!({ options: { unlockR18: true, femaleOnly: true }, enabled: true })
    expect(replaceFn).not.toHaveBeenCalled()
  })

  it('redirects once when only one param is missing', async () => {
    const c = await load('https://www.hpoi.net/hobby/all?order=add&category=100&r18=-1')
    await c.entry!({ options: { unlockR18: true, femaleOnly: true }, enabled: true })
    expect(replaceFn).toHaveBeenCalledOnce()
    const url = new URL(replaceFn.mock.calls[0][0], 'https://www.hpoi.net')
    expect(url.searchParams.get('r18')).toBe('-1')
    expect(url.searchParams.get('sex')).toBe('0')
  })
})
