import { createElement } from './createElement.js'

export function createDOMNode(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode))
  }

  if (typeof vnode.type === 'function') {
    // component node — handled by reconciler; fallback for static rendering
    const rendered = vnode.type(vnode.props)
    return createDOMNode(rendered)
  }

  const el = document.createElement(vnode.type)
  applyProps(el, {}, vnode.props)
  vnode.children.forEach(child => el.appendChild(createDOMNode(child)))
  return el
}

export function applyProps(el, oldProps, newProps) {
  // remove old props not in new
  Object.keys(oldProps).forEach(k => {
    if (!(k in newProps)) {
      if (k.startsWith('on')) {
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k])
      } else {
        el.removeAttribute(k)
      }
    }
  })

  // set new/changed props
  Object.entries(newProps).forEach(([k, v]) => {
    if (k.startsWith('on') && typeof v === 'function') {
      if (oldProps[k]) el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k])
      el.addEventListener(k.slice(2).toLowerCase(), v)
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(el.style, v)
    } else if (k === 'className') {
      el.className = v
    } else if (v !== oldProps[k]) {
      el.setAttribute(k, v)
    }
  })
}

export function render(vnode, container) {
  container.innerHTML = ''
  container.appendChild(createDOMNode(vnode))
}
