import { ContractError } from './contract/ContractError.js'

const _components = new Map()

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
