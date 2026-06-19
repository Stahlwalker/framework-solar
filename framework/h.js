import { createElement } from './core/createElement.js'
import { registry } from './registry.js'
import { renderSubComponent } from './runtime/reconciler.js'

export function h(node) {
  if (typeof node === 'string' || typeof node === 'number') return node
  if (!Array.isArray(node)) return node

  const [type, ...rest] = node

  let props = {}
  let childrenStart = 0

  if (
    rest.length > 0 &&
    rest[0] !== null &&
    typeof rest[0] === 'object' &&
    !Array.isArray(rest[0])
  ) {
    props = rest[0]
    childrenStart = 1
  }

  const children = rest.slice(childrenStart).map(h)

  if (typeof type === 'string' && registry.has(type)) {
    const component = registry.get(type)
    return renderSubComponent(component, { ...props, ...(children.length ? { children } : {}) })
  }

  return createElement(type, props, ...children)
}
