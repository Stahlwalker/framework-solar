# Solar Use Cases

Solar is designed for apps where an AI agent writes the UI, not a human. The explicit contracts, rigid file structure, and declared side effects make agent output reliably correct — not just probably correct.

---

## AI-generated internal tools

The strongest fit. A business user describes what they want ("show me overdue invoices with an approve button") and an agent generates the components. Solar's prop schema gives the agent an exact contract to target — no guessing, no runtime surprises from a mismatched prop type.

**Why Solar specifically:** internal tools get regenerated frequently as requirements change. A human isn't reviewing every generated file. Contracts catch errors at the boundary before they propagate.

---

## No-code / low-code builders

Platforms where a visual config or user input drives component generation on the backend. Solar gives the generation layer a strict, machine-readable schema for every component — the platform always knows what a valid Button or Form looks like.

**Why Solar specifically:** the component registry and slot system let the platform compose components predictably without knowing their internals.

---

## Vibe-coded apps

Apps built entirely through prompting — Cursor, Claude, or similar tools writing the full codebase. Solar reduces the "worked in isolation, broke in context" failure mode that comes from AI generating components that don't share conventions.

**Why Solar specifically:** one component per file, default export always a `defineComponent` call, event handlers always typed as `function`. Rules a model can follow without inference.

---

## Configurators and form builders

AI generates a custom UI from a data schema, API spec, or JSON config. The output is a set of Solar components wired together — predictable, validatable, and regeneratable.

**Why Solar specifically:** `useResource` and declared effects make async data fetching machine-readable. The agent knows exactly how to wire a fetch to a component without guessing at lifecycle behavior.

---

## Agent-driven UIs

An AI agent that modifies the UI at runtime in response to user requests — adding a column, swapping a chart type, filtering a list. Each modification targets a known component contract, so the agent can make surgical changes without rebuilding the tree.

**Why Solar specifically:** runtime-based means no compile step between generation and execution. The agent generates, the browser runs it, the user sees it.

---

## The common thread

In every case, a human is *describing* what they want instead of *writing* what they want. Solar is the runtime layer that makes agent output trustworthy enough to ship without a human reviewing every line.
