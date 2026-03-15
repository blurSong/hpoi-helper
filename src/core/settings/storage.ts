import { STORAGE_KEY_PREFIX } from '../utils/constants'
import type { Settings } from './types'
import { defaultSettings } from './types'

const KEY = `${STORAGE_KEY_PREFIX}settings`

function isGMAvailable(): boolean {
  return typeof GM_getValue !== 'undefined' && typeof GM_setValue !== 'undefined'
}

export function loadSettings(): Settings {
  if (isGMAvailable()) {
    const raw = GM_getValue<string | undefined>(KEY, undefined)
    if (raw) {
      try {
        return { ...defaultSettings, ...(JSON.parse(raw) as Partial<Settings>) }
      } catch {
        // Corrupted data — fall back to defaults
      }
    }
  }
  return { ...defaultSettings }
}

export function saveSettings(settings: Settings): void {
  if (isGMAvailable()) {
    GM_setValue(KEY, JSON.stringify(settings))
  }
}