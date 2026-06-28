# Building a Runtime-Based Framework for AI-Generated Code

## What we're building

A runtime-based JavaScript framework designed around a constraint most frameworks ignore: a lot of the code targeting it won't be written by a human.

Existing frameworks (React, Vue, Svelte) were designed assuming a developer writes, reads, and maintains every file. AI-generated code has different properties. It's often correct in isolation but inconsistent across files. It doesn't respect conventions it can't see. It gets regenerated frequently rather than incrementally maintained.

This framework solves for that by making contracts explicit, structure rigid, and side effects declared. The goal is AI output that's predictably correct, not just probably correct.

---

## Core principles

- **Explicit contracts over conventions:** props are typed and validated at the component boundary, not inferred
- **Declared side effects:** effects state what they depend on and what they touch; no implicit subscriptions
- **Rigid file structure:** a model generating a new component knows exactly where everything goes
- **Runtime-based:** no compiler required; builds incrementally and is debuggable in the browser
- **Small surface area:** fewer primitives means a model has fewer ways to generate something wrong

---

## Architecture

```
framework/
├── core/
│   ├── createElement.js     # vnode factory
│   ├── render.js            # mount vnode tree to DOM
│   ├── diff.js              # reconcile old and new vnode trees
│   ├── hooks.js             # useState, useEffect, useMemo
│   └── scheduler.js         # batch and defer re-renders
├── contract/
│   ├── defineComponent.js   # strict component definition with prop schema
│   ├── validate.js          # runtime prop validation
│   └── types.js             # primitive type definitions
├── runtime/
│   ├── reconciler.js        # component lifecycle and fiber-lite work loop
│   └── events.js            # delegated event handling
└── index.js                 # public API
```

---

## Build phases

### Phase 1: Virtual DOM

The foundation. A vnode is a plain JS object describing a UI node. The renderer turns it into real DOM.

```js
// createElement returns a vnode
function createElement(type, props, ...children) {
  return { type, props: props || {}, children: children.flat() }
}

// render mounts a vnode to a container
function render(vnode, container) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    container.appendChild(document.createTextNode(vnode))
    return
  }
  const el = document.createElement(vnode.type)
  Object.entries(vnode.props).forEach(([k, v]) => el.setAttribute(k, v))
  vnode.children.forEach(child => render(child, el))
  container.appendChild(el)
}
```

**Goal:** mount a static component tree with no state.

**Done when:** `render(createElement('div', {}, 'hello'), document.body)` works.

---

### Phase 2: Diffing / Reconciliation

Compare an old vnode tree against a new one and make the minimum set of DOM changes.

Three cases to handle:

1. Node type changed → replace the element
2. Text node changed → update `textContent`
3. Same type → update changed props, recurse into children

Children diffing is the hard part. Start with index-based comparison. Add key-based matching once the basic case works. That's where React's `key` prop comes from.

```js
function diff(parent, oldVnode, newVnode, index = 0) {
  if (!oldVnode) {
    parent.appendChild(createDOMNode(newVnode))
  } else if (!newVnode) {
    parent.removeChild(parent.childNodes[index])
  } else if (changed(oldVnode, newVnode)) {
    parent.replaceChild(createDOMNode(newVnode), parent.childNodes[index])
  } else if (newVnode.type) {
    updateProps(parent.childNodes[index], oldVnode.props, newVnode.props)
    const maxLen = Math.max(oldVnode.children.length, newVnode.children.length)
    for (let i = 0; i < maxLen; i++) {
      diff(parent.childNodes[index], oldVnode.children[i], newVnode.children[i], i)
    }
  }
}
```

**Goal:** update only changed nodes on re-render.

**Done when:** changing a single value doesn't rebuild the whole tree.

---

### Phase 3: Hooks

State that persists between renders without reinitializing.

React's approach: a hook index (cursor) that increments each time a hook is called, keyed to the current component. This is why hooks can't be called conditionally. The index would shift between renders and you'd read the wrong state slot.

```js
let currentComponent = null
let hookIndex = 0

function useState(initial) {
  const component = currentComponent
  const index = hookIndex++

  if (component.hooks[index] === undefined) {
    component.hooks[index] = initial
  }

  function setState(next) {
    component.hooks[index] = next
    scheduleRerender(component)
  }

  return [component.hooks[index], setState]
}
```

**Goal:** a functional component with state that re-renders on update.

**Done when:** this works:

```js
function Counter() {
  const [count, setCount] = useState(0)
  return createElement('div', {},
    createElement('p', {}, count),
    createElement('button', { onclick: () => setCount(count + 1) }, '+')
  )
}
```

---

### Phase 4: Component contracts (the differentiator)

This is what makes the framework different from React. Every component is defined through a schema that declares its shape explicitly.

```js
const Button = defineComponent({
  name: 'Button',
  props: {
    label: { type: 'string', required: true },
    onClick: { type: 'function', required: true },
    variant: { type: 'string', enum: ['primary', 'secondary'], default: 'primary' },
  },
  render({ label, onClick, variant }) {
    return createElement('button', { class: variant, onclick: onClick }, label)
  }
})
```

`defineComponent` validates props at runtime and throws a descriptive error if the contract is violated. An LLM generating a component that uses `Button` knows exactly what to pass. There's no guessing, no runtime surprise, no "this worked in isolation but broke in context."

**Goal:** prop validation that fails loudly with a message that tells you exactly what's wrong.

**Done when:** passing the wrong prop type throws: `Button: expected "label" to be string, got number`.

---

### Phase 5: Declared effects

Effects that state their dependencies and their cleanup explicitly. No implicit subscriptions.

```js
useEffect({
  deps: [userId],
  run(deps) {
    const controller = new AbortController()
    fetch(`/api/user/${deps.userId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
    return () => controller.abort()
  }
})
```

The object form (vs React's array shorthand) makes the dependency explicit and machine-readable. A model generating an effect that fetches data knows the exact shape to follow.

**Goal:** effects that re-run when deps change and clean up correctly on unmount.

---

### Phase 6: Scheduler

Batch multiple `setState` calls into a single re-render. Without this, three state updates in one event handler trigger three renders.

```js
let pending = false

function scheduleRerender(component) {
  component.dirty = true
  if (!pending) {
    pending = true
    queueMicrotask(() => {
      flushRerenders()
      pending = false
    })
  }
}
```

`queueMicrotask` runs after the current synchronous block but before the next paint. Same timing model React uses for its batch updates.

**Goal:** multiple state updates in a single event handler produce one render.

---

## File structure contract (for AI generation targets)

Every component lives in its own file. The file name is the component name. The export is always default.

```
components/
├── Button.js         # defineComponent({ name: 'Button', ... })
├── Counter.js
└── UserCard.js
```

Rules a model can follow without inference:

- One component per file
- Default export is always the `defineComponent` call
- Props schema is always the second key in the config object
- Event handlers are always typed as `function` in the schema
- No side effects outside of `useEffect`

---

## Milestones

| Phase | Milestone | Done when |
|---|---|---|
| 1 | Static renderer | `render()` mounts a vnode tree to the DOM |
| 2 | Diffing | Re-renders update only changed nodes |
| 3 | Hooks | `useState` persists state across renders |
| 4 | Contracts | `defineComponent` validates props at runtime |
| 5 | Effects | `useEffect` runs, cleans up, and re-runs on dep change |
| 6 | Scheduler | Batched updates produce one render |
| 7 | DX | Errors are descriptive enough to act on without a stack trace |

---

## What this is not

- Not a meta-framework. No SSR, no file-based routing, no build pipeline.
- Not a React replacement. Narrower scope, different constraints.
- Not optimized for humans writing components by hand, though it works fine for that too.

The thesis: the next wave of frameworks won't be designed for developers. They'll be designed for the models developers use to write code. This is an early attempt at that.

---

## Open questions

- Should the prop schema be a runtime object or a TypeScript interface? (TypeScript is better DX for humans; plain objects are more reliable targets for models)
- How does the contract model handle component composition? Does a parent need to know the schema of its children?
- Is there a case for a lightweight dev server that reads the schema and surfaces validation errors before runtime?
