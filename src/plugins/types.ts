/**
 * Plugin system type definitions.
 * Plugin logic is not implemented yet; these types reserve the API surface.
 */

export interface PluginMetadata {
  name: string
  displayName: string
  description?: string
  entry: () => void | Promise<void>
}

export type DataProvider<T> = (current: T) => T | Promise<T>

export interface HookHandlers<T = void> {
  before?: (...args: unknown[]) => T | Promise<T>
  after?: (...args: unknown[]) => T | Promise<T>
}
