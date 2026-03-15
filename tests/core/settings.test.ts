import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock GM APIs before importing settings
vi.stubGlobal('GM_getValue', vi.fn(() => undefined))
vi.stubGlobal('GM_setValue', vi.fn())
vi.stubGlobal('GM_deleteValue', vi.fn())

// Re-import fresh module for each test
const getSettings = async () => {
  vi.resetModules()
  const mod = await import('../../src/core/settings')
  return mod.settings
}

describe('settings', () => {
  beforeEach(() => {
    vi.mocked(GM_getValue).mockReturnValue(undefined)
    vi.mocked(GM_setValue).mockClear()
  })

  it('returns default value for unknown path', async () => {
    const s = await getSettings()
    expect(s.get('logLevel')).toBe('info')
  })

  it('set persists and triggers listener', async () => {
    const s = await getSettings()
    const listener = vi.fn()
    s.onChange('logLevel', listener)
    s.set('logLevel', 'debug')
    expect(listener).toHaveBeenCalledWith('debug', 'info')
    expect(GM_setValue).toHaveBeenCalled()
  })

  it('onChange with callNow calls listener immediately', async () => {
    const s = await getSettings()
    const listener = vi.fn()
    s.onChange('logLevel', listener, true)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('getComponent returns defaults for new component', async () => {
    const s = await getSettings()
    const comp = s.getComponent('testComp', {
      limit: { defaultValue: 5, displayName: 'Limit' },
    })
    expect(comp.enabled).toBe(false)
    expect(comp.options.limit).toBe(5)
  })

  it('unsubscribe stops listener from firing', async () => {
    const s = await getSettings()
    const listener = vi.fn()
    const unsub = s.onChange('logLevel', listener)
    unsub()
    s.set('logLevel', 'warn')
    expect(listener).not.toHaveBeenCalled()
  })
})
