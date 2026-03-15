import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('GM_getValue', vi.fn(() => undefined))
vi.stubGlobal('GM_setValue', vi.fn())
vi.stubGlobal('GM_deleteValue', vi.fn())
vi.stubGlobal('GM_addStyle', undefined)

vi.stubGlobal('location', { href: 'https://www.hpoi.net/' })

const getLoader = async () => {
  vi.resetModules()
  return import('../../src/components/loader')
}

const makeComponent = (overrides = {}) => ({
  name: 'testComp',
  displayName: 'Test',
  tags: [],
  entry: vi.fn(),
  enabledByDefault: true,
  ...overrides,
})

describe('loadComponent', () => {
  beforeEach(() => {
    vi.mocked(GM_getValue).mockReturnValue(undefined)
  })

  it('calls entry for enabled component', async () => {
    const { loadComponent } = await getLoader()
    const meta = makeComponent()
    await loadComponent(meta)
    expect(meta.entry).toHaveBeenCalledOnce()
  })

  it('skips component when URL does not match urlInclude', async () => {
    const { loadComponent } = await getLoader()
    const meta = makeComponent({ urlInclude: /hpoi\.net\/hobby/ })
    const result = await loadComponent(meta)
    expect(result).toBe(false)
    expect(meta.entry).not.toHaveBeenCalled()
  })

  it('does not crash when entry throws', async () => {
    const { loadComponent } = await getLoader()
    const meta = makeComponent({
      entry: vi.fn().mockRejectedValue(new Error('boom')),
    })
    await expect(loadComponent(meta)).resolves.toBe(false)
  })
})
