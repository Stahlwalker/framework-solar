import { mountComponent, unmountComponent } from '../runtime/reconciler.js'
import { registry } from '../registry.js'
import { currentComponent } from '../core/hooks.js'

let currentRoute = { path: '/', params: {} }

export function navigate(path) {
  window.location.hash = path
}

export function useRoute() {
  if (!currentComponent) throw new Error('useRoute called outside of a component render')
  return currentRoute
}

function parsePath(hash) {
  const path = hash.startsWith('#') ? hash.slice(1) : hash
  return path || '/'
}

function matchRoute(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
    } else if (patternParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}

function resolve(routes, path) {
  for (const [pattern, component] of Object.entries(routes)) {
    if (pattern === '*') continue
    const params = matchRoute(pattern, path)
    if (params !== null) return { component, params }
  }
  if (routes['*']) return { component: routes['*'], params: {} }
  return null
}

export function createRouter(routes) {
  let activeId = null
  let container = null

  function render(path) {
    if (activeId !== null) {
      unmountComponent(activeId)
      activeId = null
    }

    const match = resolve(routes, path)
    if (!match) return

    currentRoute = { path, params: match.params }

    if (!registry.has(match.component.displayName)) {
      registry.register(match.component)
    }

    activeId = mountComponent(match.component, match.params, container)
  }

  return {
    mount(el) {
      container = el
      render(parsePath(window.location.hash))
      window.addEventListener('hashchange', () => {
        render(parsePath(window.location.hash))
      })
    },
    navigate(path) {
      navigate(path)
    },
  }
}
