---
sidebarTitle: "Installation"
title: "Install via CDN, npm, or Project Scaffold"
description: "Install Solar via CDN for instant setup, npm for bundler projects, or scaffold a full app in one command. No compiler required — runs in any browser."
---

Solar is runtime-based. No compiler or build step required. Scaffold a new project with one command, or drop it into any HTML file via CDN.

**Prerequisites:** basic JavaScript. No bundler, no build tooling needed.

---

## Scaffold a new project (recommended)

```bash
npm create solarbuild@latest my-app
```

This creates a `my-app/` directory with everything wired up:

```
my-app/
├── index.html
├── main.js
├── package.json
├── solar/          # Solar framework (local copy)
└── components/
    └── App.js
```

Then:

```bash
cd my-app
npm run dev
```

Open `http://localhost:3000`. Your app is running.

---

---

## CDN (recommended to start)

The fastest way to get running. Import Solar directly from a CDN in any HTML file:

```html
<!DOCTYPE html>
<html>
  <head><title>My Solar App</title></head>
  <body>
    <div id="app"></div>
    <script type="module">
      import { defineComponent, mountComponent, registry, useState, createElement } from 'https://cdn.jsdelivr.net/npm/solarbuild/framework/index.js'

      const App = defineComponent({
        name: 'App',
        props: {},
        render() {
          const [count, setCount] = useState(0)
          return createElement('div', {},
            createElement('p', {}, `Count: ${count}`),
            createElement('button', { onclick: () => setCount(c => c + 1) }, '+'),
          )
        },
      })

      registry.register(App)
      mountComponent(App, {}, document.getElementById('app'))
    </script>
  </body>
</html>
```

No install, no config. Open the file in a browser and it works.

---

## npm

For projects using a bundler (Vite, Rollup, esbuild):

```bash
npm install solarbuild
```

Then import from the package directly:

```js
import { defineComponent, mountComponent, useState, createElement } from 'solarbuild'
```

---

## Cursor (AI editor)

If you're using [Cursor](https://cursor.sh), install the Solar plugin to give your AI assistant built-in knowledge of the Solar API — components, hooks, contracts, and the agent workflow.

1. Open the [SOLAR Framework plugin](https://cursor.directory/plugins/framework-solar) in Cursor Directory
2. Click **Add to Cursor**
3. Start a new chat — Cursor will automatically apply the Solar rules when working in `.js` files

No config required. The plugin includes the full API reference, common patterns, and how to use `registry.manifest()` for agent-driven component discovery.

---

## Project structure

Solar enforces a rigid file structure so that generated components are always predictable:

```
my-app/
├── index.html
├── main.js           # mounts root components
└── components/
    ├── Button.js     # one component per file
    ├── Counter.js
    └── UserCard.js
```

Rules:
- One component per file
- File name matches the component name
- Default export is always the `defineComponent` call

---

## Your first component

Every component is defined through a schema that declares its shape explicitly:

```js
import { defineComponent, createElement, registry } from 'solarbuild'

const Button = defineComponent({
  name: 'Button',
  props: {
    label: { type: 'string', required: true },
    onClick: { type: 'function', required: true },
    variant: { type: 'string', enum: ['primary', 'secondary'], default: 'primary' },
  },
  render({ label, onClick, variant }) {
    return createElement('button', { class: variant, onclick: onClick }, label)
  },
})

registry.register(Button)
export default Button
```

If a prop contract is violated, Solar throws a structured error immediately:

```json
{
  "error": "ContractError",
  "component": "Button",
  "prop": "label",
  "expected": "string",
  "received": "number",
  "fix": "Pass a string value for \"label\"",
  "message": "Button: prop \"label\": expected string, got number"
}
```

---

## Mounting to the DOM

Use `mountComponent` to attach a component to a DOM node:

```js
import { mountComponent } from 'solarbuild'
import Button from './components/Button.js'

mountComponent(Button, {
  label: 'Click me',
  onClick: () => console.log('clicked'),
  variant: 'primary',
}, document.getElementById('app'))
```

---

## What's next

- [defineComponent](/docs/api/define-component): the full component API
- [Agent Quickstart](/docs/guides/agent-quickstart): how an AI agent discovers and mounts Solar components
- [Building a Site](/docs/guides/building-a-site): routing, async data, and deployment end to end
