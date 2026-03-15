import { loadSettings, saveSettings } from './storage'
import type { Settings, ValueChangeListener, ComponentSettings, OptionsSchema } from './types'

type Listeners = Map<string, Set<ValueChangeListener>>

let _settings: Settings = loadSettings()
const _listeners: Listeners = new Map()

/** Read a value at a dot-separated path, e.g. "components.myFeature.enabled" */
function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, key) => {
    if (acc !== null && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

/** Write a value at a dot-separated path, returns a shallow-cloned updated root */
function setPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split('.')
  const root = { ...obj }
  let cur: Record<string, unknown> = root
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    cur[key] = typeof cur[key] === 'object' && cur[key] !== null ? { ...(cur[key] as object) } : {}
    cur = cur[key] as Record<string, unknown>
  }
  cur[keys[keys.length - 1]] = value
  return root
}

export const settings = {
  /** Get a value at a dot-separated path */
  get<T = unknown>(path: string): T {
    return getPath(_settings, path) as T
  },

  /** Set a value at a dot-separated path and persist */
  set<T>(path: string, value: T): void {
    const old = getPath(_settings, path)
    _settings = setPath(_settings as unknown as Record<string, unknown>, path, value) as unknown as Settings
    saveSettings(_settings)
    const listeners = _listeners.get(path)
    if (listeners) {
      for (const fn of listeners) fn(value, old)
    }
  },

  /** Get a component's full settings, auto-creating defaults if missing */
  getComponent<S extends OptionsSchema>(name: string, defaultOptions: Partial<S> = {}): ComponentSettings<S> {
    const existing = _settings.components[name]
    if (!existing) {
      const opts = Object.fromEntries(
        Object.entries(defaultOptions).map(([k, def]) => [k, def?.defaultValue]),
      ) as ComponentSettings<S>['options']
      const defaults: ComponentSettings<S> = { enabled: false, options: opts }
      this.set(`components.${name}`, defaults)
      return defaults
    }
    return existing as ComponentSettings<S>
  },

  /** Add a listener for changes at a dot-separated path */
  onChange<T = unknown>(path: string, listener: ValueChangeListener<T>, callNow = false): () => void {
    if (!_listeners.has(path)) _listeners.set(path, new Set())
    _listeners.get(path)!.add(listener as ValueChangeListener)
    if (callNow) {
      const current = getPath(_settings, path) as T
      listener(current, current)
    }
    return () => _listeners.get(path)?.delete(listener as ValueChangeListener)
  },

  /** Reload settings from storage (call if you suspect external mutation) */
  reload(): void {
    _settings = loadSettings()
  },
}

export type { Settings, ComponentSettings, OptionsSchema, OptionDefinition, OptionsValues, ValueChangeListener } from './types'
