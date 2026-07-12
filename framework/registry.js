import { ContractError } from './contract/ContractError.js'

// Use a global so all instances of Solar (regardless of import path) share one registry.
// This lets solarbuild-mcp read the same registry that user components register into.
const GLOBAL_KEY = Symbol.for('solarbuild.registry')
if (!globalThis[GLOBAL_KEY]) globalThis[GLOBAL_KEY] = new Map()
const _components = globalThis[GLOBAL_KEY]

export const registry = {
  register(component) {
    if (!component || !component._isComponent) {
      throw new ContractError({
        component: component?.displayName || 'Unknown',
        prop: null,
        expected: 'a component created with defineComponent()',
        received: typeof component,
        fix: 'Wrap this function with defineComponent() before registering',
      })
    }
    _components.set(component.displayName, component)
  },

  get(name) {
    return _components.get(name)
  },

  has(name) {
    return _components.has(name)
  },

  list() {
    return [..._components.values()].map(c => ({
      name: c.displayName,
      props: c._schema,
    }))
  },

  manifest() {
    return JSON.stringify(this.list(), null, 2)
  },
}
