# Todo

## Publishing
- [x] Publish `solarbuild` to npm (v0.1.0 live)
- [x] Publish `create-solarbuild` to npm (v0.1.0 live)
- [x] Verify `npm create solarbuild@latest my-app` works end to end
- [x] Update installation doc CDN URL to npm (cdn.jsdelivr.net/npm/solarbuild)

## Docs
- [x] Write API reference (`defineComponent`, hooks, `h()`, registry)
- [x] Set up Mintlify docs site (solar-e6dcfc3e.mintlify.app)
- [x] Buy `solarbuild.dev` domain
- [x] Add custom domain to Mintlify (`docs.solarbuild.dev`)
- [x] Remove `vitepress-setup.md` (replaced by Mintlify)

## Framework
- [x] All 7 build phases implemented (renderer, diffing, hooks, contracts, effects, scheduler, structured errors)

## Distribution
- [x] Monorepo — both packages in `framework-solar`

## Pre-launch (GitHub repo going public)

### Critical
- [x] Fix missing logo files — `mint.json` references `/logo/light.svg` and `/logo/dark.svg` that don't exist
- [x] Fix CDN URL inconsistency — `README.md:205` uses GitHub raw CDN (`cdn.jsdelivr.net/gh/Stahlwalker/...`), should match npm CDN everywhere (`cdn.jsdelivr.net/npm/solarbuild/...`)

### Important
- [x] Add `test-solar-app/` to `.gitignore` (local testing artifact, shouldn't be in public repo)
- [x] Remove debug `console.log` from `demo/main.js:69` (`LifecycleDemo unmounted`)

## Homepage
- [x] Create solarbuild.dev homepage (live at solarbuild.dev)

### Nice-to-have
- [x] Add CHANGELOG (v0.1.0 baseline)
- [x] Add CONTRIBUTING.md
- [x] Improve README quick-start with a full runnable HTML+browser snippet
- [x] Fix "nine build phases" copy in README — there are 7 phases, the demo has 9 sections

---

## Post-launch: Framework gaps (from homepage build feedback)

### Critical (~1–2 days each)
- [x] **Hooks don't work in sub-components** `~1–2 days` — added `renderSubComponent()`: position-keyed child instances with own hook state, push/pop context around renders, child re-renders redirect to root, orphan cleanup on conditional rendering.
- [x] **No `onMount` lifecycle** `~2 hrs` — added `{ onMount }` option to `mountComponent()` for out-of-component use (canvas, scroll listeners, etc.). Hook-based `onMount` already existed for root components.

### Important
- [x] **No portal / teleport mechanism** `~3–4 hrs` — added `mountPortal(fn, props, targetNode)`. Auto-registers ownership when called during render/onMount; parent unmount cascades to portals. Manual lifecycle supported via returned ID.
- [x] **No `innerHTML` / `dangerouslySetInnerHTML`** `~30 min` — add one `if (k === 'innerHTML')` branch in `applyProps` in `render.js`.
- [x] **`children` not treated as a reserved prop** `~30 min` — documented: omitting from schema emits a dev warning but does not throw.
- [x] **Scaffold creates a subdirectory, not the project root** `~1–2 hrs` — added `--root` flag to `create-solar/index.js`; scaffolds into `process.cwd()`.

### Nice-to-have
- [x] **`style` prop duality undocumented** `~30 min` — documented both object and string forms in `h.mdx`.
- [x] **No router** `~1–2 days` — hash-based router with `:param` patterns, `*` wildcard, `useRoute()` hook, `navigate()`, auto-registration of route components.
- [x] **No `<head>` / meta management** `~1–2 hrs` — added `setMeta({ title, description, og })` utility in `framework/core/meta.js`.

### Docs gaps (~3–4 hrs total)
- [x] Document hooks-in-child-components limitation (added Warning callout to `hooks.mdx` and `h.mdx`)
- [x] Document children/slots pattern — how `h()` forwards children as a prop (already covered in `h.mdx`)
- [x] Document `h()` vs `createElement()` trade-offs and when to use each (already covered in `h.mdx`)
- [x] Add third-party library integration guide (CDN loading + post-mount timing pattern — added to `building-a-site.mdx`)
- [x] Add deployment guide (GitHub Pages subdirectory gotcha — added to `building-a-site.mdx`)
- [x] Document `onMount` workaround (post-`mountComponent()` script ordering — added to `building-a-site.mdx`)

> **Sprint estimate:** ~2 days without router, ~1 week with. Fast wins: `innerHTML` prop (30 min) and `onMount` (2 hrs).
