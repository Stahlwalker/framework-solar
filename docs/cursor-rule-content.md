# Solar Framework Rules

Solar (`solarbuild`) is a no-build, browser-native UI framework designed for AI-generated code. It runs directly in the browser via CDN or npm — no bundler, no JSX, no compile step.

## Installation

```html
<!-- CDN (browser) -->
<script type="module">
  import { defineComponent, mountComponent, h, registry, Types } from 'https://cdn.jsdelivr.net/npm/solarbuild/framework/index.js'
</script>
```

```js
// npm
import { defineComponent, mountComponent, h, registry, Types } from 'solarbuild'
```

## Core pattern

Always use `defineComponent()` to define components — never plain functions. Always register with `registry.register()` before mounting.

```js
import { defineComponent, mountComponent, h, registry, Types } from 'solarbuild'

const Button = defineComponent({
  name: 'Button',
  props: {
    label: { type: Types.string, required: true },
    onClick: { type: Types.function, required: true },
  },
  render({ label, onClick }) {
    return h('button', { onclick: onClick }, label)
  },
})

registry.register(Button)
mountComponent(Button, { label: 'Click me', onClick: () => alert('hi') }, document.getElementById('app'))
```

## Types

Available types from `Types`: `string`, `number`, `boolean`, `function`, `object`, `array`, `any`, `slot`

Props can be:
- `{ type: Types.string, required: true }` — required
- `{ type: Types.string, default: 'hello' }` — optional with default
- `{ type: Types.string, enum: ['sm', 'md', 'lg'] }` — enum constraint

## Structured errors

When props are wrong, Solar throws a `ContractError` with a `fix` field — always read and act on it:

```js
try {
  mountComponent(Button, { label: 42 }, el)
} catch (e) {
  if (e.name === 'ContractError') {
    console.log(e.fix) // "Pass a string value for 'label'"
    // correct the props and retry
  }
}
```

## Registry and agent discovery

Agents should call `registry.manifest()` to discover available components and their prop schemas before mounting:

```js
const manifest = registry.manifest() // returns JSON string
const components = JSON.parse(manifest)
// [{ name: 'Button', props: { label: { type: 'string', required: true }, ... } }]
```

## createElement / h

`h(tag, props, ...children)` is the vnode builder. `createElement` is an alias.

- Tag can be a string (`'div'`) or a component function
- Props are plain objects; event handlers use lowercase DOM names (`onclick`, `oninput`)
- Children can be strings, vnodes, or arrays

```js
h('div', { class: 'card' },
  h('h1', null, title),
  h(Button, { label: 'OK', onClick: handleClick })
)
```

## Hooks

Hooks work inside `render()` functions of components defined with `defineComponent()`.

```js
import { useState, useMemo, useResource, useSubscription, onMount, onUnmount } from 'solarbuild'

const Counter = defineComponent({
  name: 'Counter',
  props: {},
  render() {
    const [count, setCount] = useState(0)
    return h('button', { onclick: () => setCount(count + 1) }, `Count: ${count}`)
  },
})
```

- `useState(initial)` — returns `[value, setter]`
- `useMemo(compute, deps)` — memoized derived value, recomputed only when deps change
- `useResource(asyncFn, deps)` — async data fetching, returns `{ data, loading, error }`
- `useSubscription({ source, event, handler })` — attaches an event listener, removed automatically on unmount or when source/event/handler change
- `onMount(fn)` — runs after mount, returns cleanup fn
- `onUnmount(fn)` — runs on unmount

## Lifecycle

```js
mountComponent(Component, props, targetEl, { onMount: () => console.log('mounted') })
unmountComponent(targetEl)
```

## Router

```js
import { createRouter, navigate, useRoute } from 'solarbuild'

createRouter([
  { path: '/', component: Home },
  { path: '/user/:id', component: UserPage },
])

// inside a component render():
const { params, path } = useRoute()

// navigate programmatically:
navigate('/user/42')
```

## Slots

Pass rendered vnodes as props using `Types.slot`:

```js
const Card = defineComponent({
  name: 'Card',
  props: {
    header: { type: Types.slot, required: true },
  },
  render({ header }) {
    return h('div', { class: 'card' }, header)
  },
})

// Pass a rendered vnode:
mountComponent(Card, { header: h(Title, { text: 'Hello' }) }, el)
```

## Portals

Mount a component outside its parent DOM hierarchy:

```js
import { mountPortal } from 'solarbuild'
mountPortal(Modal, { open: true }, document.body)
```

## Meta / head management

```js
import { setMeta } from 'solarbuild'
setMeta({ title: 'My App', description: 'Built with Solar', og: { image: '/og.png' } })
```

## Agent workflow

1. Call `registry.manifest()` to get available components and schemas
2. Mount with correct props
3. Catch `ContractError`, read `.fix`, correct props, retry
4. Never guess prop types — use the manifest schema

## What Solar does NOT have

- No JSX (use `h()` instead)
- No bundler required
- No SSR
- No TypeScript types (runtime contracts replace compile-time types)
