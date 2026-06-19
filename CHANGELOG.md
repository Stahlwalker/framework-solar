# Changelog

## [0.2.0] — 2026-06-19

### Framework (`solarbuild`)

- **Hooks in sub-components** — components composed via `h()` now have full hook support (`useState`, `useMemo`, `useResource`, `onMount`, etc.). Each sub-component gets its own reconciler instance keyed by position in the parent's render output. State changes trigger a root re-render; orphaned instances are cleaned up automatically on conditional rendering.
- **Router** — `createRouter(routes)` for hash-based multi-page apps. Supports `:param` patterns, `*` wildcard fallback, and auto-registration of route components. `useRoute()` hook returns `{ path, params }` inside any component. `navigate(path)` for programmatic navigation.
- **`mountPortal(fn, props, targetNode)`** — mount a component into an arbitrary DOM node outside `#app`. Auto-registers portal ownership when called during a parent render or `onMount`; parent unmount cascades to its portals automatically.
- **`mountComponent` `onMount` option** — `mountComponent(fn, props, el, 0, { onMount: () => {} })` for post-render callbacks outside the component tree (canvas init, third-party widgets, scroll listeners).
- **`innerHTML` prop** — `h(['div', { innerHTML: rawHtml }])` injects raw HTML. Children are ignored when set. Useful for syntax-highlighted code and markdown output.
- **`setMeta({ title, description, og })`** — sets `document.title`, meta description, and Open Graph tags. Creates or updates tags in `<head>` without duplicating them.

### Scaffolding (`create-solarbuild`)

- **`--root` flag** — `npm create solarbuild@latest --root` scaffolds into the current directory instead of a subdirectory. Useful for GitHub Pages and hosts that expect files at the repo root.

---

## [0.1.0] — 2024-06-19

Initial public release.

### Framework (`solarbuild`)

- `defineComponent` — strict prop schema with runtime validation and structured `ContractError` output
- `createElement` / `mountComponent` — vnode-based rendering to the DOM
- `diff` — reconciliation of old and new vnode trees
- `useState` — component-local state with batched re-renders
- `useMemo` — memoized derived values with dependency tracking
- `useResource` — async data fetching with automatic `AbortController` cancellation on key change
- `useSubscription` — event listener that attaches/detaches when source, event, or handler changes
- `onMount` / `onUnmount` — lifecycle callbacks that run once per component lifetime
- `scheduler` — batched updates via `queueMicrotask`
- `registry` — component catalog with `registry.manifest()` for model-readable discovery
- `h()` — compact array-notation parser; registry-aware component resolution
- Typed slot props — `{ type: 'slot', accepts: 'ComponentName' }` with runtime enforcement

### Scaffolding (`create-solarbuild`)

- `npm create solarbuild@latest <name>` — scaffolds a minimal Solar app with a working component and dev server
