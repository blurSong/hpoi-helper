import { settings } from '../core/settings'
import { addStyle, removeStyle } from '../core/style'
import { matchCurrentUrl } from '../core/utils'
import { logger } from '../core/logger'
import type { ComponentMetadata, OptionsSchema, TestPattern } from './types'

function matchesPattern(pattern: TestPattern): boolean {
  const patterns = Array.isArray(pattern) ? pattern : [pattern]
  return matchCurrentUrl(patterns.map((p) => (typeof p === 'string' ? new RegExp(p) : p)))
}

function shouldRunOnCurrentPage(meta: ComponentMetadata): boolean {
  if (meta.urlInclude && !matchesPattern(meta.urlInclude)) return false
  if (meta.urlExclude && matchesPattern(meta.urlExclude)) return false
  return true
}

function buildOptions<S extends OptionsSchema>(meta: ComponentMetadata<S>): ReturnType<typeof settings.getComponent<S>> {
  const schema = meta.options ?? ({} as S)
  return settings.getComponent<S>(meta.name, schema)
}

const loadedComponents = new Map<string, ComponentMetadata>()

export async function loadComponent(meta: ComponentMetadata): Promise<boolean> {
  const componentSettings = buildOptions(meta)

  // Apply enabledByDefault on first load
  if (meta.enabledByDefault && !settings.get<boolean | undefined>(`components.${meta.name}.enabled`)) {
    settings.set(`components.${meta.name}.enabled`, true)
    componentSettings.enabled = true
  }

  if (!componentSettings.enabled) {
    logger.debug(`Skipping disabled component: ${meta.name}`)
    return false
  }

  if (!shouldRunOnCurrentPage(meta)) {
    logger.debug(`Skipping component (URL mismatch): ${meta.name}`)
    return false
  }

  // Inject instant styles
  for (const { id, style } of meta.instantStyles ?? []) {
    addStyle(typeof style === 'function' ? style() : style, `${meta.name}:${id}`)
  }

  try {
    await meta.entry({ options: componentSettings.options as never, enabled: true })
    loadedComponents.set(meta.name, meta)
    logger.debug(`Loaded: ${meta.name}`)
    return true
  } catch (err) {
    logger.error(`Error in component "${meta.name}":`, err)
    return false
  }
}

export async function loadAllComponents(components: ComponentMetadata[]): Promise<void> {
  let loaded = 0
  for (const meta of components) {
    const ok = await loadComponent(meta)
    if (ok) loaded++
  }
  logger.info(`${loaded}/${components.length} components active`)
}

export function enableComponent(name: string): void {
  settings.set(`components.${name}.enabled`, true)
  const meta = loadedComponents.get(name)
  if (meta?.reload) {
    meta.reload().catch((e) => logger.error(`reload error in "${name}":`, e))
  }
}

export function disableComponent(name: string): void {
  settings.set(`components.${name}.enabled`, false)
  const meta = loadedComponents.get(name)
  if (meta) {
    // Remove instant styles
    for (const { id } of meta.instantStyles ?? []) {
      removeStyle(`${name}:${id}`)
    }
    if (meta.unload) {
      meta.unload().catch((e) => logger.error(`unload error in "${name}":`, e))
    }
    loadedComponents.delete(name)
  }
}

/** Returns a snapshot of all currently loaded component metadata */
export function getLoadedComponents(): ComponentMetadata[] {
  return Array.from(loadedComponents.values())
}
