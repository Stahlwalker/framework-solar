// Delegated event handling — attach once to root, route by target
const handlers = new WeakMap()

export function setHandler(el, event, fn) {
  if (!handlers.has(el)) handlers.set(el, {})
  handlers.get(el)[event] = fn
}

export function removeHandler(el, event) {
  if (handlers.has(el)) delete handlers.get(el)[event]
}

export function setupDelegation(root, events) {
  events.forEach(event => {
    root.addEventListener(event, e => {
      let target = e.target
      while (target && target !== root) {
        const map = handlers.get(target)
        if (map && map[event]) {
          map[event](e)
          break
        }
        target = target.parentNode
      }
    })
  })
}
