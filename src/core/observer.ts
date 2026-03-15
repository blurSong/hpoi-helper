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
