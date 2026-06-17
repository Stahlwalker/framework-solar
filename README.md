# Starlord

A runtime-based JavaScript UI framework designed around a constraint most frameworks ignore: a lot of the code targeting it won't be written by a human.

Existing frameworks — React, Vue, Svelte — were designed assuming a developer writes, reads, and maintains every file. AI-generated code has different properties. It's often correct in isolation but inconsistent across files. It doesn't respect conventions it can't see. It gets regenerated frequently rather than incrementally maintained.

Starlord solves for that by making contracts explicit, structure rigid, and side effects declared. The goal is AI output that's predictably correct, not just probably correct.

---

## Core principles

- **Explicit contracts over conventions** — props are typed and validated at the component boundary, not inferred
- **Declared side effects** — effects state what they depend on and what they touch; no implicit subscriptions
- **Rigid file structure** — a model generating a new component knows exactly where everything goes
- **Runtime-based** — no compiler required; debuggable in the browser as-is
- **Small surface area** — fewer primitives means fewer ways to generate something wrong

---

## How it works

Every component is defined through a schema that declares its shape explicitly:

```js
import { createElement, defineComponent } from './framework/index.js'

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

Pass the wrong type and you get an error that tells you exactly what's wrong:

```
Button: expected "label" to be string, got number
```

State works like React hooks, without the magic:

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
```

Effects use an object form that makes dependencies explicit and machine-readable:

```js
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
│   ├── validate.js          # runtime prop validation
│   └── types.js             # primitive type definitions
├── runtime/
│   ├── reconciler.js        # component lifecycle and mount/unmount
│   └── events.js            # delegated event handling
└── index.js                 # public API
```

Components live in `components/`, one per file, default export is always the `defineComponent` call. That's a rule a model can follow without inference.

---

## Running the demo

```bash
npm run dev
```

Open `http://localhost:3456/demo/` (trailing slash required — static server quirk).

The demo covers all six build phases: static rendering, diffing, hooks, contract validation, declared effects, and batched updates.

---

## What this is not

- Not a meta-framework. No SSR, no routing, no build pipeline.
- Not a React replacement. Narrower scope, different constraints.
- Not optimized for humans writing components by hand — though it works for that too.

The thesis: the next wave of frameworks won't be designed for developers. They'll be designed for the models developers use to write code. This is an early attempt at that.
