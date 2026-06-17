# Starlord

A runtime-based JavaScript UI framework designed around a constraint most frameworks ignore: a lot of the code targeting it won't be written by a human.

Existing frameworks — React, Vue, Svelte — were designed assuming a developer writes, reads, and maintains every file. AI-generated code has different properties. It's often correct in isolation but inconsistent across files. It doesn't respect conventions it can't see. It gets regenerated frequently rather than incrementally maintained.

Starlord solves for that by making contracts explicit, structure rigid, and side effects declared. The goal is AI output that's predictably correct, not just probably correct.

---

## Core principles

- **Explicit contracts over conventions** — props are typed and validated at the component boundary, not inferred
- **Component registry** — models read a machine-readable manifest before generating any composition code
- **Structured errors** — validation failures return parseable JSON an agent can act on directly
- **Declared side effects** — effects state what they depend on and what they touch; no implicit subscriptions
- **Typed composition** — slot props enforce which component can fill them, with runtime validation
- **Runtime-based** — no compiler required; debuggable in the browser as-is
- **Small surface area** — fewer primitives means fewer ways to generate something wrong

---

## How it works

### Defining a component

Every component declares its shape explicitly. Register it so other components and models can discover it.

```js
import { createElement, defineComponent, registry } from './framework/index.js'

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

registry.register(Button)
```

### Structured errors

Pass the wrong type and you get a structured error — not just a string. An agent can parse and self-correct without regex.

```js
Button({ label: 42, onClick: () => {} })
// throws ContractError:
{
  "error": "ContractError",
  "component": "Button",
  "prop": "label",
  "expected": "string",
  "received": "number",
  "fix": "Pass a string value for \"label\""
}
```

### Component registry

Before generating composition code, a model reads the full catalog:

```js
registry.manifest()
// →
[
  {
    "name": "Button",
    "props": {
      "label": { "type": "string", "required": true },
      "onClick": { "type": "function", "required": true },
      "variant": { "type": "string", "enum": ["primary", "secondary"], "default": "primary" }
    }
  },
  ...
]
```

### Typed slots (component composition)

A parent component declares which component type can fill a slot. Passing anything else throws a `ContractError`.

```js
const Card = defineComponent({
  name: 'Card',
  props: {
    title: { type: 'string', required: true },
    action: { type: 'slot', accepts: 'Button', required: true },
  },
  render({ title, action }) {
    return createElement('div', { class: 'card' },
      createElement('h3', {}, title),
      action,
    )
  }
})

// valid
Card({ title: 'Hello', action: Button({ label: 'Go', onClick: () => {} }) })

// throws: Card: prop "action": expected slot(Button), got vnode with no _source
Card({ title: 'Hello', action: createElement('button', {}, 'Go') })
```

### Compact h() notation

`h()` parses a dense array format into a vnode tree. Registry-aware — component names resolve automatically.

```js
import { h } from './framework/index.js'

// plain DOM nodes
h(['div', { class: 'row' },
  ['p', {}, 'Hello'],
  ['button', { class: 'btn' }, 'Click'],
])

// registered component by name — dispatches to Button()
h(['Button', { label: 'Save', onClick: handleSave, variant: 'primary' }])
```

### Hooks and effects

State and effects work like React, with one difference: `useEffect` uses an object form that makes dependencies named and machine-readable.

```js
const Counter = defineComponent({
  name: 'Counter',
  props: {},
  render() {
    const [count, setCount] = useState(0)
    return createElement('div', {},
      createElement('p', {}, `Count: ${count}`),
      Button({ label: '+', onClick: () => setCount(c => c + 1) })
    )
  }
})

useEffect({
  deps: { userId },
  run({ userId }) {
    const controller = new AbortController()
    fetch(`/api/user/${userId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
    return () => controller.abort()
  }
})
```

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
│   ├── ContractError.js     # structured error class with toJSON()
│   ├── validate.js          # runtime prop validation
│   └── types.js             # primitive type definitions + slot type
├── runtime/
│   ├── reconciler.js        # component lifecycle and mount/unmount
│   └── events.js            # delegated event handling
├── registry.js              # component catalog and manifest
├── h.js                     # compact array notation parser
└── index.js                 # public API
```

Components live in `components/`, one per file, default export is the `defineComponent` call, self-registered on import. Rules a model can follow without inference.

---

## Running the demo

```bash
npm run dev
```

Open `http://localhost:3456/demo/` (trailing slash required — static server quirk).

The demo covers all nine build phases: static rendering, diffing, hooks, contract validation, declared effects, batched updates, registry manifest, compact h() notation, and typed slots.

---

## Docs

- [`docs/roadmap.md`](docs/roadmap.md) — implementation plan for the four AI-first improvements
- [`docs/landscape.md`](docs/landscape.md) — research on comparable systems (Google A2UI, OpenUI, GenUI, SpecifyUI)

---

## What this is not

- Not a meta-framework. No SSR, no routing, no build pipeline.
- Not a React replacement. Narrower scope, different constraints.
- Not optimized for humans writing components by hand — though it works for that too.

The thesis: the next wave of frameworks won't be designed for developers. They'll be designed for the models developers use to write code. This is an early attempt at that.
