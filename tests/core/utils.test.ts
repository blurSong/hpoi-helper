import { describe, it, expect, beforeEach, vi } from 'vitest'
import { dq, dqa, matchCurrentUrl } from '../../src/core/utils'

describe('dq / dqa', () => {
  beforeEach(() => {
    document.body.innerHTML = '<ul><li class="item">a</li><li class="item">b</li></ul>'
  })

  it('dq returns first match', () => {
    expect(dq('.item')?.textContent).toBe('a')
  })

  it('dq returns null when not found', () => {
    expect(dq('.missing')).toBeNull()
  })

  it('dqa returns all matches', () => {
    expect(dqa('.item')).toHaveLength(2)
  })
})

describe('matchCurrentUrl', () => {
  it('matches by regex', () => {
    vi.stubGlobal('location', { href: 'https://www.hpoi.net/hobby/12345/' })
    expect(matchCurrentUrl([/hpoi\.net\/hobby/])).toBe(true)
  })

  it('does not match unrelated url', () => {
    vi.stubGlobal('location', { href: 'https://www.example.com/' })
    expect(matchCurrentUrl([/hpoi\.net/])).toBe(false)
  })
})
