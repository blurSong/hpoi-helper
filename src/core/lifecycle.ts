import { logger } from './logger'

export enum LifecycleEvent {
  Start = 'Start',
  ComponentsLoaded = 'ComponentsLoaded',
  End = 'End',
}

export function raiseLifecycleEvent(event: LifecycleEvent): void {
  logger.debug(`Lifecycle: ${event}`)
}
