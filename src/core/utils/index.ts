/** Query a single element (shorthand for document.querySelector) */
export const dq = <T extends Element = Element>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector)

/** Query all matching elements as an array */
export const dqa = <T extends Element = Element>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector))

/** Test whether the current URL matches any of the given patterns */
export const matchCurrentUrl = (patterns: Array<string | RegExp>): boolean => {
  const url = location.href
  return patterns.some((p) => (typeof p === 'string' ? url.includes(p) : p.test(url)))
}
