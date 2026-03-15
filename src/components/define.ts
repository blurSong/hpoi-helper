import type { ComponentMetadata } from './types'
import type { OptionsSchema } from '../core/settings/types'

/**
 * Type-safe helper for defining a component.
 * Returns the metadata unchanged; the generic parameter infers option types.
 *
 * @example
 * export const component = defineComponent({
 *   name: 'myFeature',
 *   displayName: 'My Feature',
 *   tags: [componentTags.utility],
 *   options: {
 *     limit: { defaultValue: 10, displayName: 'Result limit' },
 *   },
 *   entry: ({ options }) => { console.log(options.limit) },
 * })
 */
export function defineComponent<S extends OptionsSchema = Record<never, never>>(
  metadata: ComponentMetadata<S>,
): ComponentMetadata<S> {
  return metadata
}
