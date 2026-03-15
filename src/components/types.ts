import type { ComponentTag } from './tags'
import type { OptionsSchema, OptionsValues, OptionDefinition } from '../core/settings/types'

export type { OptionsSchema, OptionsValues, OptionDefinition }

export type TestPattern = RegExp | string | Array<RegExp | string>

/** A style to inject immediately when the component loads, before `entry` runs */
export interface InstantStyle {
  id: string
  style: string | (() => string)
}

/** Context passed to the component's entry function */
export interface ComponentEntryContext<S extends OptionsSchema = OptionsSchema> {
  /** The component's current option values */
  options: OptionsValues<S>
  /** Whether the component is enabled */
  enabled: boolean
  /** Access to the raw settings API */
  // settings is imported by components directly to avoid circular dep
}

/** Full component descriptor */
export interface ComponentMetadata<S extends OptionsSchema = OptionsSchema> {
  /** Unique programmatic identifier (camelCase) */
  name: string
  /** Human-readable name shown in the settings UI */
  displayName: string
  /** Short description shown in the settings UI */
  description?: string
  /** Category tags */
  tags: ComponentTag[]

  // --- Lifecycle ---
  /** Called once when the component is loaded and enabled */
  entry: (context: ComponentEntryContext<S>) => void | Promise<void>
  /** Called when the component is re-enabled after being disabled */
  reload?: () => void | Promise<void>
  /** Called when the component is disabled */
  unload?: () => void | Promise<void>

  // --- Page targeting ---
  /** Only run on pages matching these patterns */
  urlInclude?: TestPattern
  /** Never run on pages matching these patterns */
  urlExclude?: TestPattern

  // --- Options schema ---
  /** Declare user-configurable options; drives the settings UI */
  options?: S

  // --- Defaults ---
  /** Whether this component is enabled by default (default: false) */
  enabledByDefault?: boolean

  // --- UI ---
  /**
   * When true, the settings panel omits the component-level enable toggle
   * and shows only the option controls. Use for components whose sub-options
   * already provide full control (a master toggle would be redundant).
   * The component should also set enabledByDefault: true.
   */
  alwaysOn?: boolean

  // --- Styles ---
  /** CSS to inject immediately when the component loads */
  instantStyles?: InstantStyle[]
}
