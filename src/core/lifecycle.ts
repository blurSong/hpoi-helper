import { logger } from './logger'

export enum LifecycleEvent {
  Start = 'Start',
  ComponentsLoaded = 'ComponentsLoaded',
  End = 'End',
}

type EventListener = () => void | Promise<void>

const listeners = new Map<LifecycleEvent, Set<EventListener>>()

export function onLifecycleEvent(event: LifecycleEvent, fn: EventListener): void {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(fn)
}

export async function raiseLifecycleEvent(event: LifecycleEvent): Promise<void> {
  logger.debug(`Lifecycle: ${event}`)
  const fns = listeners.get(event)
  if (!fns) return
  for (const fn of fns) {
    try {
      await fn()
    } catch (e) {
      logger.error(`Error in lifecycle listener (${event}):`, e)
    }
  }
}
