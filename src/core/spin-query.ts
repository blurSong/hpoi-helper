export interface SpinQueryConfig {
  /** Maximum number of attempts (default: 15) */
  maxRetry?: number
  /** Milliseconds between attempts (default: 500) */
  interval?: number
}

/**
 * Poll for a DOM element matching `selector` until it appears or max retries exceeded.
 * Returns the element, or null on timeout.
 */
export function spinQuery<T extends Element = Element>(
  selector: string,
  config: SpinQueryConfig = {},
): Promise<T | null> {
  const { maxRetry = 15, interval = 500 } = config
  return new Promise((resolve) => {
    let attempts = 0
    const run = () => {
      const el = document.querySelector<T>(selector)
      if (el) return resolve(el)
      attempts++
      if (attempts >= maxRetry) return resolve(null)
      setTimeout(run, interval)
    }
    run()
  })
}

/**
 * Poll for all elements matching `selector` until at least one appears.
 */
export function spinQueryAll<T extends Element = Element>(
  selector: string,
  config: SpinQueryConfig = {},
): Promise<T[]> {
  const { maxRetry = 15, interval = 500 } = config
  return new Promise((resolve) => {
    let attempts = 0
    const run = () => {
      const els = Array.from(document.querySelectorAll<T>(selector))
      if (els.length > 0) return resolve(els)
      attempts++
      if (attempts >= maxRetry) return resolve([])
      setTimeout(run, interval)
    }
    run()
  })
}
