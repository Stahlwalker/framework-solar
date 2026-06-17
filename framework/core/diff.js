import { createDOMNode, applyProps } from './render.js'

function changed(a, b) {
  return typeof a !== typeof b ||
    (typeof a === 'string' && a !== b) ||
    (typeof a === 'number' && a !== b) ||
    a.type !== b.type
}

export function diff(parent, oldVnode, newVnode, index = 0) {
  const domNode = parent.childNodes[index]

  if (oldVnode === undefined || oldVnode === null) {
    parent.appendChild(createDOMNode(newVnode))
    return
  }

  if (newVnode === undefined || newVnode === null) {
    if (domNode) parent.removeChild(domNode)
    return
  }

  if (changed(oldVnode, newVnode)) {
    parent.replaceChild(createDOMNode(newVnode), domNode)
    return
  }

  // text/number node, same value — nothing to do
  if (typeof newVnode === 'string' || typeof newVnode === 'number') return

  // same element type — patch props and recurse
  applyProps(domNode, oldVnode.props, newVnode.props)

  const oldLen = oldVnode.children.length
  const newLen = newVnode.children.length
  const maxLen = Math.max(oldLen, newLen)

  // iterate in reverse when removing to avoid index shifting
  for (let i = maxLen - 1; i >= 0; i--) {
    if (i >= newLen) {
      const child = domNode.childNodes[i]
      if (child) domNode.removeChild(child)
    }
  }

  for (let i = 0; i < newLen; i++) {
    diff(domNode, oldVnode.children[i], newVnode.children[i], i)
  }
}
