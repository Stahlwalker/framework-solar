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

// ─── useState ────────────────────────────────────────────────────────────────

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

// ─── useMemo ─────────────────────────────────────────────────────────────────

export function useMemo(compute, deps) {
  const component = currentComponent
  if (!component) throw new Error('useMemo called outside of a component render')
  const index = hookIndex++

  const cached = component.hooks[index]
  if (cached && depsEqual(cached.deps, deps)) return cached.value

  const value = compute()
  component.hooks[index] = { value, deps }
  return value
}

// ─── useResource ─────────────────────────────────────────────────────────────
// Async data fetching. Re-fetches when key changes. Cancels in-flight requests
// automatically. Returns { data, loading, error }.
//
// useResource({
//   key: userId,
//   fetch: async (signal) => {
//     const res = await fetch(`/api/user/${userId}`, { signal })
//     return res.json()
//   }
// })

export function useResource({ key, fetch: fetchFn }) {
  const component = currentComponent
  if (!component) throw new Error('useResource called outside of a component render')
  const index = hookIndex++

  const keyStr = JSON.stringify(key)
  const prev = component.hooks[index]

  if (!prev || prev.key !== keyStr) {
    if (prev?.controller) prev.controller.abort()

    const controller = new AbortController()
    const slot = {
      key: keyStr,
      data: prev?.data ?? null,
      loading: true,
      error: null,
      controller,
      cleanup: () => controller.abort(),
    }
    component.hooks[index] = slot

    fetchFn(controller.signal)
      .then(data => {
        if (controller.signal.aborted) return
        component.hooks[index] = { ...component.hooks[index], data, loading: false, error: null }
        scheduleRerender(component)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        component.hooks[index] = { ...component.hooks[index], error: err, loading: false }
        scheduleRerender(component)
      })
  }

  const { data, loading, error } = component.hooks[index]
  return { data, loading, error }
}

// ─── useSubscription ─────────────────────────────────────────────────────────
// Attaches an event listener and removes it when the source, event, or handler
// changes, or when the component unmounts. Works with DOM EventTargets and
// Node-style emitters.
//
// useSubscription({ source: window, event: 'resize', handler: () => setW(window.innerWidth) })

export function useSubscription({ source, event, handler }) {
  const component = currentComponent
  if (!component) throw new Error('useSubscription called outside of a component render')
  const index = hookIndex++

  const prev = component.hooks[index]
  const changed = !prev || prev.source !== source || prev.event !== event || prev.handler !== handler

  if (changed) {
    if (prev) detach(prev.source, prev.event, prev.handler)
    attach(source, event, handler)
    component.hooks[index] = {
      source, event, handler,
      cleanup: () => detach(source, event, handler),
    }
  }
}

function attach(source, event, handler) {
  if (source?.addEventListener) source.addEventListener(event, handler)
  else if (source?.on) source.on(event, handler)
}

function detach(source, event, handler) {
  if (source?.removeEventListener) source.removeEventListener(event, handler)
  else if (source?.off) source.off(event, handler)
}

// ─── onMount / onUnmount ─────────────────────────────────────────────────────
// Lifecycle hooks. onMount runs once after the first render.
// onUnmount registers a cleanup that runs when the component is removed.
//
// onMount(() => { analytics.track('mounted') })
// onUnmount(() => { subscription.cancel() })

export function onMount(fn) {
  const component = currentComponent
  if (!component) throw new Error('onMount called outside of a component render')
  const index = hookIndex++

  if (!component.hooks[index]) {
    component.hooks[index] = { ran: false }
    queueMicrotask(() => {
      if (!component.hooks[index]?.ran) {
        component.hooks[index] = { ran: true }
        fn()
      }
    })
  }
}

export function onUnmount(fn) {
  const component = currentComponent
  if (!component) throw new Error('onUnmount called outside of a component render')
  const index = hookIndex++

  component.hooks[index] = { cleanup: fn }
}

// ─── internal ────────────────────────────────────────────────────────────────

function depsEqual(a, b) {
  if (!a || !b) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i])
  }
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  return keysA.length === keysB.length && keysA.every(k => a[k] === b[k])
}
