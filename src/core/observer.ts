/** DOM observation utilities */

/** Watch direct children of an element */
export function observeChildren(
  target: Node,
  callback: (mutations: MutationRecord[]) => void,
): MutationObserver {
  const obs = new MutationObserver(callback)
  obs.observe(target, { childList: true })
  return obs
}

/** Watch all descendant mutations */
export function observeSubtree(
  target: Node,
  callback: (mutations: MutationRecord[]) => void,
): MutationObserver {
  const obs = new MutationObserver(callback)
  obs.observe(target, { childList: true, subtree: true })
  return obs
}

/** Watch attribute changes on an element */
export function observeAttributes(
  target: Element,
  callback: (mutations: MutationRecord[]) => void,
  attributeFilter?: string[],
): MutationObserver {
  const obs = new MutationObserver(callback)
  obs.observe(target, { attributes: true, attributeFilter })
  return obs
}

/** Detect URL changes (hash/pushState navigation) */
export function onUrlChange(callback: (url: string) => void): () => void {
  let last = location.href

  const check = () => {
    const current = location.href
    if (current !== last) {
      last = current
      callback(current)
    }
  }

  const origPush = history.pushState.bind(history)
  const origReplace = history.replaceState.bind(history)

  history.pushState = (...args: Parameters<typeof history.pushState>) => {
    origPush(...args)
    check()
  }
  history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
    origReplace(...args)
    check()
  }
  window.addEventListener('popstate', check)

  return () => {
    history.pushState = origPush
    history.replaceState = origReplace
    window.removeEventListener('popstate', check)
  }
}
