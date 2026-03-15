import { logger } from './core/logger'
import { settings } from './core/settings'
import { raiseLifecycleEvent, LifecycleEvent } from './core/lifecycle'
import { registerComponents, loadAllComponents } from './components/loader'
import { mountSettingsPanel } from './ui/settings-panel'
import { VERSION } from './core/utils/constants'

// Auto-discover all feature components via import.meta.glob
const featureModules = import.meta.glob<{ component: import('./components/types').ComponentMetadata }>(
  './features/*/index.ts',
  { eager: true },
)

async function bootstrap() {
  await raiseLifecycleEvent(LifecycleEvent.Start)

  logger.setLevel(settings.get('logLevel') ?? 'info')
  logger.info(`v${VERSION} initializing…`)

  const components = Object.values(featureModules)
    .map((m) => m.component)
    .filter(Boolean)

  // Register all components before loading so the settings UI can list them all
  registerComponents(components)

  await loadAllComponents(components)

  await raiseLifecycleEvent(LifecycleEvent.ComponentsLoaded)

  // Mount settings panel after components are ready
  mountSettingsPanel()

  await raiseLifecycleEvent(LifecycleEvent.End)
  logger.info('Ready.')
}

bootstrap().catch((e) => console.error('[Hpoi Helper] Bootstrap failed:', e))
