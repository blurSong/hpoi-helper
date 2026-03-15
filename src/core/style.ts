const injectedStyles = new Map<string, HTMLStyleElement>()

/**
 * Inject a `<style>` tag into `<head>`. Pass an `id` to allow later removal.
 * If an element with the same id already exists it will be replaced.
 */
export function addStyle(css: string, id?: string): HTMLStyleElement {
  if (id && injectedStyles.has(id)) {
    removeStyle(id)
  }

  let el: HTMLStyleElement
  if (typeof GM_addStyle !== 'undefined') {
    // GM_addStyle returns the injected element in most userscript managers
    el = GM_addStyle(css) as unknown as HTMLStyleElement
  } else {
    el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
  }

  if (id) {
    el.setAttribute('data-hpoi-style', id)
    injectedStyles.set(id, el)
  }

  return el
}

/** Remove a previously injected style by its id */
export function removeStyle(id: string): void {
  const el = injectedStyles.get(id)
  if (el) {
    el.remove()
    injectedStyles.delete(id)
  }
}

/** Check whether a style with the given id is currently active */
export function hasStyle(id: string): boolean {
  return injectedStyles.has(id)
}
