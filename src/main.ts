import { logger } from './core/logger'
import { settings } from './core/settings'
import { raiseLifecycleEvent, LifecycleEvent } from './core/lifecycle'
import { loadAllComponents } from './components/loader'
import { VERSION } from './core/utils/constants'

// Auto-discover all feature components via import.meta.glob
// Each feature must export a `component` named export from its index.ts
const featureModules = import.meta.glob<{ component: import('./components/types').ComponentMetadata }>(
  './features/*/index.ts',
  { eager: true },
)

async function bootstrap() {
  await raiseLifecycleEvent(LifecycleEvent.Start)

  // Apply log level from settings
  logger.setLevel(settings.get('logLevel') ?? 'info')

  logger.info(`v${VERSION} initializing…`)

  const components = Object.values(featureModules)
    .map((m) => m.component)
    .filter(Boolean)

  await loadAllComponents(components)

  await raiseLifecycleEvent(LifecycleEvent.ComponentsLoaded)
  await raiseLifecycleEvent(LifecycleEvent.End)

  logger.info('Ready.')
}

bootstrap().catch((e) => console.error('[Hpoi Helper] Bootstrap failed:', e))
