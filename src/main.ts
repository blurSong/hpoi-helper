import { logger } from './core/logger'
import { settings } from './core/settings'
import { raiseLifecycleEvent, LifecycleEvent } from './core/lifecycle'
import { registerComponents, loadAllComponents } from './components/loader'
import { mountSettingsPanel } from './ui/settings-panel'
import { VERSION } from './core/utils/constants'
import type { ComponentMetadata } from './components/types'

// Auto-discover all feature components via import.meta.glob
const featureModules = import.meta.glob<{ component: ComponentMetadata }>(
  './features/*/index.ts',
  { eager: true },
)

async function bootstrap() {
  raiseLifecycleEvent(LifecycleEvent.Start)

  logger.setLevel(settings.get('logLevel') ?? 'info')
  logger.info(`v${VERSION} initializing…`)

  const components: ComponentMetadata[] = []
  for (const mod of Object.values(featureModules)) {
    if (mod.component) components.push(mod.component)
  }

  registerComponents(components)
  await loadAllComponents(components)

  raiseLifecycleEvent(LifecycleEvent.ComponentsLoaded)

  mountSettingsPanel()

  raiseLifecycleEvent(LifecycleEvent.End)
  logger.info('Ready.')
}

bootstrap().catch((e) => console.error('[Hpoi Helper] Bootstrap failed:', e))
