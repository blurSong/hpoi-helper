import { LOG_PREFIX } from './utils/constants'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

let currentLevel: LogLevel = 'info'

export const logger = {
  setLevel(level: LogLevel) {
    currentLevel = level
  },

  debug(...args: unknown[]) {
    if (levels[currentLevel] <= levels.debug) console.debug(LOG_PREFIX, ...args)
  },
  info(...args: unknown[]) {
    if (levels[currentLevel] <= levels.info) console.log(LOG_PREFIX, ...args)
  },
  warn(...args: unknown[]) {
    if (levels[currentLevel] <= levels.warn) console.warn(LOG_PREFIX, ...args)
  },
  error(...args: unknown[]) {
    if (levels[currentLevel] <= levels.error) console.error(LOG_PREFIX, ...args)
  },
}
