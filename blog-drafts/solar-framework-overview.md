# Solar: A Runtime UI Framework Built for AI-Generated Code

**Package:** `solarbuild` (v0.2.3) · **License:** MIT · **Repo:** github.com/Stahlwalker/framework-solar · **Docs:** docs.solarbuild.dev · **Homepage:** solarbuild.dev

---

## The problem it solves

Existing UI frameworks (React, Vue, Svelte) were designed assuming a human writes, reads, and maintains every file. That assumption breaks when an AI agent is the one writing the UI.

When an agent builds UI with React or Vue today, it guesses: it guesses prop names, guesses types, guesses valid values. When it guesses wrong, it gets a stack trace — and a stack trace is not machine-readable feedback an agent can reliably act on.

AI-generated code also behaves differently from human-written code in three ways:
- It's often correct in isolation but inconsistent across files (no shared, unstated conventions).
- It doesn't respect conventions it can't see (nothing enforces them at the boundary).
- It gets regenerated wholesale far more often than it gets incrementally maintained.

Solar's bet: the next wave of frameworks won't be designed for developers — they'll be designed for the models developers use to write code. Solar makes contracts explicit, structure rigid, and side effects declared, so agent output is *predictably* correct instead of *probably* correct.

---

## Why this was built

The immediate trigger is the feedback loop, not the code itself. Other layers of the stack already solved this problem for their own domain: APIs have OpenAPI/JSON Schema, databases have schemas and constraints, typed languages have compilers. Each of those gives a machine a structured description of what's valid *before* something breaks, and a structured error *after*. UI frameworks never needed that, because a human was always in the loop to read the stack trace, understand the framework's implicit conventions, and fix it.

That assumption is now wrong for a growing share of UI code. As more UI gets written by agents — "vibe coded" end-to-end, generated inside no-code platforms, or produced by an agent that's iterating on its own output — the missing piece is a framework-level contract an agent can read *before* it writes code, and a structured error it can act on *after*, without a human relaying the fix. Solar exists to fill that specific gap: it's a from-scratch runtime that treats "a model will read this API" as the primary design constraint, rather than retrofitting typed props onto a framework built for human authors.

The project's own build order makes the motivation legible: `ContractError` (structured errors) was built first because everything else depends on it, then the component `registry` (so a model can discover valid components *before* generating code, not just find out it guessed wrong after), then typed `slot` composition (extending the contract model to parent/child relationships), then compact `h()` serialization (a token-efficient generation target once the registry existed). Each of those, by the project's own account, was informed directly by watching what the leading AI-first UI systems (Google A2UI, OpenUI, SpecifyUI) converged on independently — see [Where it sits in the landscape](#where-it-sits-in-the-landscape-as-of-2026) below.

---

## Core principles

- **Explicit contracts over conventions** — props are typed and validated at the component boundary, not inferred.
- **Component registry** — models read a machine-readable manifest of every component before generating composition code.
- **Structured errors** — validation failures return parseable JSON an agent can act on directly, not a string to regex.
- **Declared side effects** — effects state what they depend on and what they touch; no implicit subscriptions.
- **Typed composition** — slot props enforce which component type can fill them, validated at runtime.
- **Runtime-based** — no compiler required; incremental, debuggable in the browser as-is.
- **Small surface area** — fewer primitives means fewer ways for a model to generate something wrong.

---

## How it works

### Defining a component

Every component declares its shape explicitly via `defineComponent`, then registers itself so other components (and models) can discover it.

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

### Structured errors instead of stack traces

Passing the wrong prop type throws a `ContractError` — a structured object, not a string — so an agent can parse it and self-correct without regex.

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

The agent reads the `fix` field and retries. No human required.

### Component registry / manifest

Before generating composition code, a model reads the full catalog of registered components as JSON:

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

A parent component declares which component *type* can fill a slot. Passing anything else throws a `ContractError` — composition mistakes are caught the same way prop mistakes are.

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

### Compact `h()` notation

`h()` parses a dense array format into a vnode tree. It's registry-aware, so component names resolve automatically — useful as a compact generation target for a model.

```js
import { h } from './framework/index.js'

// plain DOM nodes
h(['div', { class: 'row' },
  ['p', {}, 'Hello'],
  ['button', { class: 'btn' }, 'Click'],
])

// registered component by name, dispatches to Button()
h(['Button', { label: 'Save', onClick: handleSave, variant: 'primary' }])
```

### Hooks and effects

State uses `useState`, same as React. But instead of a general-purpose `useEffect`, Solar splits side effects into three explicit, narrower primitives — each one machine-readable in its own right:

- **`useResource`** — async data fetching with automatic `AbortController` cancellation on key change.
- **`useSubscription`** — event listener that attaches/detaches when source, event, or handler changes.
- **`onMount` / `onUnmount`** — lifecycle callbacks that run once, not on every render.

```js
const UserCard = defineComponent({
  name: 'UserCard',
  props: { userId: { type: 'number', required: true } },
  render({ userId }) {
    const [width, setWidth] = useState(window.innerWidth)

    // cancels the previous fetch automatically when userId changes
    const { data, loading, error } = useResource({
      key: userId,
      fetch: async (signal) => {
        const res = await fetch(`/api/user/${userId}`, { signal })
        return res.json()
      },
    })

    // attaches once, re-attaches only if source/event/handler changes
    useSubscription({ source: window, event: 'resize', handler: () => setWidth(window.innerWidth) })

    onMount(() => analytics.track('UserCard mounted'))
    onUnmount(() => analytics.track('UserCard unmounted'))

    if (loading) return createElement('p', {}, 'Loading...')
    return createElement('p', {}, `${data.name} - viewport: ${width}px`)
  }
})
```

Other framework features: a router (`createRouter`, hash-based, `:param` and `*` wildcard support, `useRoute()`, `navigate()`), `mountPortal` for mounting outside the root container, an `innerHTML` prop for raw HTML injection, and `setMeta()` for document title/description/OG tags.

---

## Architecture

```
framework/
├── core/
│   ├── createElement.js     # vnode factory
│   ├── render.js            # mount vnode tree to DOM
│   ├── diff.js              # reconcile old and new vnode trees
│   ├── hooks.js             # useState, useMemo, useResource, useSubscription, onMount, onUnmount
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

Components live in `components/`, one per file, default export is always the `defineComponent` call, and each component self-registers on import. This is deliberate: a model generating a new component knows exactly where it goes and what shape it takes without inferring convention from surrounding code.

Rules a model can follow without inference:
- One component per file, file name = component name
- Default export is always the `defineComponent` call
- Props schema is always the second key in the config object
- Event handlers are always typed as `function`
- No side effects outside `useEffect`/the declared-effect primitives

---

## Where it runs

- **No build step.** Runtime-based — works via CDN with a plain `<script type="module">` tag, no compiler or bundler required.
- **Scaffolding:** `npm create solarbuild@latest my-app` (or `--root` to scaffold into the current directory, useful for GitHub Pages).
- **Cursor plugin:** cursor.directory/plugins/framework-solar — adds Solar's rules/conventions to Cursor so an AI assistant knows the API out of the box.
- **MCP server:** `solarbuild-mcp` exposes a project's Solar component registry as callable MCP tools — `manifest` (full registry schema), `component` (single component schema), `validate` (props validation with fix instructions) — so an agent can discover components and self-correct without reading static docs.
- **Live demo:** a StackBlitz sandbox runs a 3-step agent loop in the browser — discover components via `registry.manifest()`, catch a `ContractError` on a bad mount, self-correct using the `fix` field.

---

## Use cases

Solar targets apps where an AI agent writes the UI, not a human:

- **AI-generated internal tools** — the strongest fit. A business user describes what they want and an agent generates components against an explicit contract. Internal tools get regenerated frequently and often aren't reviewed line-by-line, so catching errors at the boundary matters more than for hand-maintained code.
- **No-code / low-code builders** — a visual config or user input drives backend component generation. The registry and slot system let a platform compose components predictably without knowing their internals.
- **Vibe-coded apps** — apps built entirely through prompting (Cursor, Claude, etc.). Solar's rigid, inference-free rules reduce the "worked in isolation, broke in context" failure mode common to AI-generated codebases.
- **Configurators and form builders** — UI generated from a data schema, API spec, or JSON config. `useResource` and declared effects make async data wiring machine-readable.
- **Agent-driven UIs** — an agent that modifies the UI at runtime (add a column, swap a chart, filter a list) against known component contracts, without rebuilding the tree.

The common thread: a human is *describing* what they want instead of *writing* what they want, and Solar is the runtime layer that makes the agent's output trustworthy enough to ship without a human reviewing every line.

---

## Benefits vs. other frameworks

### vs. React / Vue / Svelte

| | React / Vue / Svelte | Solar |
|---|---|---|
| Prop validation | Optional (PropTypes/TS), usually erased at runtime in production builds | Always on, enforced at the component boundary at runtime |
| Failure mode on bad props | A stack trace, or silent `undefined` propagation | A structured `ContractError` object (`expected`/`received`/`fix`) |
| Discovering valid components | Read source, Storybook, or hand-written docs | `registry.manifest()` — one machine-readable JSON call |
| Composition safety | A child can be anything; wrong child usually fails deep in a render, far from the mistake | Typed `slot` props reject the wrong child type at the parent boundary, by name |
| Effect model | One general `useEffect` — dependency array is easy to get subtly wrong (missing dep, stale closure) | Three narrow, purpose-built primitives (`useResource`, `useSubscription`, `onMount`/`onUnmount`) that are harder to misuse because each does one thing |
| File/convention structure | Convention, enforced by team norms and code review | Rigid by design (one component per file, default export always `defineComponent`) — there's no convention to infer, and no reviewer required to catch a drift from it |
| Build step | Usually requires a compiler/bundler (JSX, SFC compilation) | None — runtime-based, works from a CDN `<script type="module">` tag |

The underlying reason these matter more for agent-written code than human-written code: a human developer internalizes "don't pass a number where PropTypes doesn't complain but it'll break," an agent doesn't unless the framework tells it so *in the same turn it made the mistake*, in a format it can parse without a human relaying the error back.

### vs. other AI-first UI systems (A2UI, OpenUI, Storybook MCP)

Solar isn't the only project chasing this thesis (see the [landscape](#where-it-sits-in-the-landscape-as-of-2026) section), but it differs from them in a few concrete ways:

- **No dependency on a pre-approved catalog restriction at the architecture level.** A2UI and OpenUI both hard-restrict the model to a pre-registered component library as a safety mechanism. Solar's registry is informational (discovery + validation), not a hard execution sandbox — simpler to adopt in an existing codebase, at the cost of the stronger safety guarantee those systems offer.
- **No build step, no dependencies.** OpenUI and Storybook MCP both sit on top of an existing framework/toolchain. Solar is a from-scratch runtime — nothing to compile, nothing else to install to try it.
- **Smaller and more legible.** Solar's entire core is a handful of files (see [Architecture](#architecture)) rather than a full-stack generative UI platform. That makes it easier to read end-to-end and to use as a base for experimenting with the contract-enforcement idea itself, rather than adopting a production platform's opinions wholesale.
- **Trade-off:** this also means Solar has a narrower feature set than A2UI/OpenUI today — no streaming-optimized wire format, no adoption by other agent frameworks (CopilotKit, AG-UI), and a smaller ecosystem. The roadmap explicitly tracks closing specific gaps (structured errors → registry → slots → compact serialization) identified by comparing against those systems.

---

## What this is not

- Not a meta-framework — no SSR, no file-based routing, no build pipeline.
- Not a React replacement — narrower scope, different constraints.
- Not optimized exclusively for humans writing components by hand, though it works fine for that too.

---

## Where it sits in the landscape (as of 2026)

Solar's core thesis — replace free-form LLM output with a typed, validated intermediate format that constrains what the model can produce and what the renderer will accept — is shared by a handful of other 2024–2026 projects, commercial and academic:

- **Google A2UI** (Dec 2025, open source, adopted by CopilotKit/Flutter GenUI/AG-UI) — represents UI as a flat adjacency list referencing a pre-approved component catalog, preventing arbitrary LLM code execution at the architecture level.
- **OpenUI (thesysdev)** — closest in architecture to Solar: a token-efficient streaming language, Zod schema enforcement on props (the rough equivalent of Solar's `props` schema object), and hard restriction to a pre-registered component library.
- **Storybook MCP Server** — layers contract enforcement on top of an *existing* component system (self-healing loop: generate → write Storybook interaction tests → run a11y/tests → fix → re-validate) rather than baking contracts into the framework itself.
- **Academic work** — SpecifyUI (arXiv:2509.07334), GenUI/BISCUIT from Stanford SALT Lab (arXiv:2508.19227, ACL 2026, 84% win rate over conversational Claude 3.7), the earlier Apple ML Research BISCUIT (arXiv:2404.07387), and a compile-time validation pipeline paper (arXiv:2604.05150) — all converge on structured intermediate representations outperforming free-form generation.

**Where Solar differs:** most of the above are either commercial products with broader scope (A2UI, OpenUI) or academic pipelines restricted to a specific output format (e.g., GenUI targets HTML only). Solar is a from-scratch runtime implementation of the core idea — no dependencies, no build step, no compiler, just the primitives — which makes it a small, legible base for experimenting with the architecture rather than a production platform.

Open questions the project itself flags as unresolved: whether the prop schema should be a runtime object or a TypeScript interface (better human DX vs. more reliable model target), how the contract model should handle component composition across schema boundaries, and whether there's a case for a dev server that surfaces validation errors before runtime.

---

## Getting started

```bash
npm create solarbuild@latest my-app
cd my-app
npm run dev
```

Or, no install, no build step, straight from a CDN:

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script type="module">
    import {
      defineComponent, mountComponent, registry,
      useState, createElement
    } from 'https://cdn.jsdelivr.net/npm/solarbuild/framework/index.js'

    const Counter = defineComponent({
      name: 'Counter',
      props: {},
      render() {
        const [count, setCount] = useState(0)
        return createElement('button', { onclick: () => setCount(n => n + 1) }, `Clicked ${count} times`)
      }
    })

    registry.register(Counter)
    mountComponent(Counter, {}, document.getElementById('app'))
  </script>
</body>
</html>
```

---

## Links

- Docs: https://docs.solarbuild.dev
- Installation: https://docs.solarbuild.dev/docs/installation
- Use cases: https://docs.solarbuild.dev/docs/use-cases
- API reference: https://docs.solarbuild.dev/docs/api/define-component
- MCP server docs: https://docs.solarbuild.dev/docs/integrations/mcp
- GitHub: https://github.com/Stahlwalker/framework-solar
- npm: https://www.npmjs.com/package/solarbuild
- Cursor plugin: https://cursor.directory/plugins/framework-solar
