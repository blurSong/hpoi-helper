import type { LogLevel } from '../logger'

export type OptionValue = string | number | boolean

export interface OptionDefinition<T extends OptionValue = OptionValue> {
  defaultValue: T
  displayName: string
  /** For string options: constrain to a fixed set of values */
  choices?: string[]
  /** Shown in the settings UI as a description */
  description?: string
}

export type OptionsSchema = Record<string, OptionDefinition>
export type OptionsValues<S extends OptionsSchema> = { [K in keyof S]: S[K]['defaultValue'] }

export interface ComponentSettings<S extends OptionsSchema = OptionsSchema> {
  enabled: boolean
  options: OptionsValues<S>
}

export interface Settings {
  components: Record<string, ComponentSettings>
  logLevel: LogLevel
  [key: string]: unknown
}

export const defaultSettings: Settings = {
  components: {},
  logLevel: 'info',
}

export type ValueChangeListener<T = unknown> = (value: T, oldValue: T) => void
