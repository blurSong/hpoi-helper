import { describe, it, expect, beforeEach, vi } from 'vitest'
import { spinQuery, spinQueryAll } from '../../src/core/spin-query'

describe('spinQuery', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  it('resolves immediately when element exists', async () => {
    document.body.innerHTML = '<div class="target"></div>'
    const el = spinQuery('.target', { interval: 100 })
    vi.runAllTimersAsync()
    expect(await el).not.toBeNull()
  })

  it('resolves after element is added', async () => {
    const promise = spinQuery('.lazy', { interval: 100, maxRetry: 5 })
    setTimeout(() => {
      document.body.innerHTML = '<div class="lazy"></div>'
    }, 250)
    vi.runAllTimersAsync()
    expect(await promise).not.toBeNull()
  })

  it('returns null on timeout', async () => {
    const promise = spinQuery('.never', { interval: 50, maxRetry: 3 })
    vi.runAllTimersAsync()
    expect(await promise).toBeNull()
  })
})

describe('spinQueryAll', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  it('returns empty array on timeout', async () => {
    const promise = spinQueryAll('.none', { interval: 50, maxRetry: 2 })
    vi.runAllTimersAsync()
    expect(await promise).toEqual([])
  })
})
