# Changelog

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
