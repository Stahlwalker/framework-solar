import { setCurrentComponent, clearCurrentComponent } from '../core/hooks.js'
import { setFlushCallback } from '../core/scheduler.js'
import { createDOMNode } from '../core/render.js'
import { diff } from '../core/diff.js'
import { registry } from '../registry.js'
import { ContractError } from '../contract/ContractError.js'

// registry: component instance → { fn, props, hooks, vnode, domParent, domIndex }
const instances = new Map()
let instanceCounter = 0

export function mountComponent(fn, props, container, index = 0) {
  if (!fn._isComponent) {
    throw new ContractError({
      component: fn.displayName || fn.name || 'Unknown',
      prop: null,
      expected: 'a component created with defineComponent()',
      received: 'plain function',
      fix: 'Wrap this function with defineComponent() before mounting',
    })
  }
  if (!registry.has(fn.displayName)) {
    throw new ContractError({
      component: fn.displayName,
      prop: null,
      expected: 'component to be registered via registry.register()',
      received: 'unregistered component',
      fix: `Call registry.register(${fn.displayName}) before mounting`,
    })
  }
  const id = ++instanceCounter
  const instance = {
    id,
    fn,
    props,
    hooks: [],
    vnode: null,
    domParent: container,
    domIndex: index,
  }

  instances.set(id, instance)
  renderInstance(instance)
  return id
}

function renderInstance(instance) {
  setCurrentComponent(instance)
  let vnode
  try {
    vnode = instance.fn(instance.props)
  } finally {
    clearCurrentComponent()
  }

  if (instance.vnode === null) {
    // first render
    const dom = createDOMNode(vnode)
    const ref = instance.domParent.childNodes[instance.domIndex]
    if (ref) {
      instance.domParent.insertBefore(dom, ref)
    } else {
      instance.domParent.appendChild(dom)
    }
  } else {
    diff(instance.domParent, instance.vnode, vnode, instance.domIndex)
  }

  instance.vnode = vnode
}

// wire scheduler → reconciler
setFlushCallback(component => {
  const instance = [...instances.values()].find(i => i === component)
  if (instance) renderInstance(instance)
})

export function unmountComponent(id) {
  const instance = instances.get(id)
  if (!instance) return

  // run effect cleanups
  instance.hooks.forEach(hook => {
    if (hook && typeof hook === 'object' && hook.cleanup) hook.cleanup()
  })

  const dom = instance.domParent.childNodes[instance.domIndex]
  if (dom) instance.domParent.removeChild(dom)
  instances.delete(id)
}
