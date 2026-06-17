const dirtyComponents = new Set()
let pending = false
let flushCallback = null

export function setFlushCallback(fn) {
  flushCallback = fn
}

export function scheduleRerender(component) {
  dirtyComponents.add(component)
  if (!pending) {
    pending = true
    queueMicrotask(() => {
      flushRerenders()
      pending = false
    })
  }
}

function flushRerenders() {
  const toFlush = [...dirtyComponents]
  dirtyComponents.clear()
  toFlush.forEach(component => {
    if (flushCallback) flushCallback(component)
  })
}
