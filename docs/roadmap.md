# Solar Roadmap

Four improvements informed by the AI-first UI framework landscape research. Each closes a gap between what Solar does today and what the leading systems (A2UI, OpenUI, GenUI) do.

---

## Priority order

1. **Structured errors** — everything else builds on this
2. **Component registry** — needed before compact serialization
3. **Slots / composition** — extends the contract model
4. **Compact serialization** — optimization, depends on registry

---

## 1. Structured error objects

**Problem:** Solar throws plain strings. An agent consuming a validation error can't parse it programmatically — it has to regex a human-readable message.

**What we're building:** A `ContractError` class that extends `Error` with structured fields an agent can act on directly.

```js
throw new ContractError({
  component: 'Button',
  prop: 'label',
  expected: 'string',
  received: 'number',
  fix: 'Pass a string value for "label"'
})

// error.toJSON() →
{
  "error": "ContractError",
  "component": "Button",
  "prop": "label",
  "expected": "string",
  "received": "number",
  "fix": "Pass a string value for \"label\""
}
```

**Files:**
- New: `framework/contract/ContractError.js`
- Modify: `framework/contract/types.js` — replace all `throw new Error(...)` with `ContractError`

**Inspired by:** SpecifyUI's exception-handling loop (arXiv:2509.07334) — invalid LLM output triggers a structured error that goes back to the model for correction.

---

## 2. Component registry

**Problem:** Solar validates props once a component is called, but there's no way for a model to know what components exist before generating code. Unknown components fail silently or at mount time with a generic error.

**What we're building:** A module-level registry. Components self-register on import. The registry exposes a machine-readable manifest — a model reads it before generating any composition code.

```js
// components self-register
registry.register(Button)
registry.register(Counter)

// model reads the manifest before generating
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

Mounting an unregistered component throws a `ContractError` with a fix instruction.

**Files:**
- New: `framework/registry.js`
- Modify: `framework/runtime/reconciler.js` — guard against unregistered components
- Modify: `components/Button.js`, `components/Counter.js` — self-register on import
- Modify: `framework/index.js` — export `registry`

**Inspired by:** Google A2UI's component catalog — agents can only request components from a pre-approved list.

---

## 3. Slots (typed component composition)

**Problem:** Solar has no answer for the open question in FRAMEWORK.md: how does the contract model handle component composition? A parent receiving a child as a prop has no way to declare or enforce what that child should be.

**What we're building:** A `slot` prop type. Components tag their output vnode with `_source = name`. Slot validation checks that tag.

```js
const Card = defineComponent({
  name: 'Card',
  props: {
    action: { type: 'slot', accepts: 'Button', required: true },
  },
  render({ action }) {
    return createElement('div', { class: 'card' },
      createElement('div', { class: 'card__body' }, 'Card content'),
      action,
    )
  }
})

// valid — Button produces a vnode tagged _source: 'Button'
Card({ action: Button({ label: 'Save', onClick: () => {} }) })

// invalid — throws ContractError
Card({ action: createElement('button', {}, 'Save') })
// ContractError: Card: expected "action" to be slot(Button), got no _source tag
// Fix: Pass a vnode produced by the Button component
```

**Files:**
- Modify: `framework/contract/types.js` — add `slot` to `Types`, add slot validation logic
- Modify: `framework/contract/defineComponent.js` — tag returned vnode with `_source`

**Solves:** The open question from FRAMEWORK.md that none of the surveyed systems (A2UI, GenUI, OpenUI) have answered cleanly.

---

## 4. Compact serialization (`h()`)

**Problem:** `createElement` calls are verbose. A model generating a tree writes a lot of tokens per node. OpenUI benchmarked ~52% token reduction with a compact format.

**What we're building:** An `h()` function that parses a compact array notation. Registry-aware — component names resolve to their registered function automatically.

```js
// instead of:
createElement('div', { class: 'row' },
  Button({ label: 'Save', onClick: handleSave, variant: 'primary' })
)

// model generates:
h(['div', { class: 'row' },
  ['Button', { label: 'Save', onClick: handleSave, variant: 'primary' }]
])
```

`h()` is a pure vnode factory — no lifecycle, no state. Stateful components still go through `mountComponent`. The compact format is just a denser input for building vnode trees.

**Files:**
- New: `framework/h.js`
- Modify: `framework/index.js` — export `h`

**Inspired by:** OpenUI's compact streaming-first language (github.com/thesysdev/openui).

---

## Implementation order

| Step | File | Change |
|---|---|---|
| 1 | `framework/contract/ContractError.js` | Create |
| 2 | `framework/contract/types.js` | Use ContractError, add slot type |
| 3 | `framework/contract/defineComponent.js` | Tag vnode with `_source` |
| 4 | `framework/registry.js` | Create |
| 5 | `framework/runtime/reconciler.js` | Registry mount guard |
| 6 | `framework/h.js` | Create |
| 7 | `framework/index.js` | Export registry, ContractError, h |
| 8 | `components/Button.js` | Self-register |
| 9 | `components/Counter.js` | Self-register |
| 10 | `demo/index.html` | Add registry, h(), slot demo sections |
| 11 | `demo/main.js` | Wire up new demo sections |

---

## Open questions (not in this iteration)

- Should `registry.manifest()` be the primary interface for model context, or should there be a more structured schema format (JSON Schema, OpenAPI-style)?
- Should slot `accepts` support multiple component names — `accepts: ['Button', 'IconButton']`?
- Is there a case for a lightweight dev server that reads the registry at startup and surfaces the manifest before any code runs?
