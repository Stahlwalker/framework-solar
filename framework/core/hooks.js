import { scheduleRerender } from './scheduler.js'

export let currentComponent = null
export let hookIndex = 0

export function setCurrentComponent(component) {
  currentComponent = component
  hookIndex = 0
}

export function clearCurrentComponent() {
  currentComponent = null
  hookIndex = 0
}

export function useState(initial) {
  const component = currentComponent
  if (!component) throw new Error('useState called outside of a component render')
  const index = hookIndex++

  if (component.hooks[index] === undefined) {
    component.hooks[index] = typeof initial === 'function' ? initial() : initial
  }

  function setState(next) {
    const prev = component.hooks[index]
    const value = typeof next === 'function' ? next(prev) : next
    if (value === prev) return
    component.hooks[index] = value
    scheduleRerender(component)
  }

  return [component.hooks[index], setState]
}

export function useMemo(compute, deps) {
  const component = currentComponent
  if (!component) throw new Error('useMemo called outside of a component render')
  const index = hookIndex++

  const cached = component.hooks[index]
  if (cached && depsEqual(cached.deps, deps)) {
    return cached.value
  }

  const value = compute()
  component.hooks[index] = { value, deps }
  return value
}

export function useEffect(config) {
  const component = currentComponent
  if (!component) throw new Error('useEffect called outside of a component render')
  const index = hookIndex++

  const prev = component.hooks[index]
  const { deps, run } = config

  const shouldRun = !prev || !depsEqual(prev.deps, deps)
  if (shouldRun) {
    if (prev && prev.cleanup) prev.cleanup()
    // defer to after render
    queueMicrotask(() => {
      const cleanup = run(deps ? Object.fromEntries(
        Object.keys(deps).map((k, i) => [k, deps[i]])
      ) : {})
      component.hooks[index] = { deps, cleanup: cleanup || null }
    })
  }
}

function depsEqual(a, b) {
  if (!a || !b) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i])
  }
  // object deps form
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  return keysA.length === keysB.length && keysA.every(k => a[k] === b[k])
}
