import { logger } from './logger'
import { settings } from './settings'
import { observeChildren, observeSubtree, observeAttributes, onUrlChange } from './observer'
import { spinQuery, spinQueryAll } from './spin-query'
import { addStyle, removeStyle, hasStyle } from './style'
import { dq, dqa, matchCurrentUrl } from './utils'
import { urlPatterns } from './utils/urls'

export const coreApis = {
  logger,
  settings,
  observer: { observeChildren, observeSubtree, observeAttributes, onUrlChange },
  spinQuery: { spinQuery, spinQueryAll },
  style: { addStyle, removeStyle, hasStyle },
  utils: { dq, dqa, matchCurrentUrl },
  urlPatterns,
}

export type CoreApis = typeof coreApis
