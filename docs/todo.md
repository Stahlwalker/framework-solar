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
- [ ] **Hooks don't work in sub-components** `~1–2 days` — `h.js` calls registry components directly, bypassing `setCurrentComponent()`. Fix = spawn child reconciler instances in `h()`. Touches the whole render pipeline.
- [ ] **No `onMount` lifecycle** `~2 hrs` — `mountComponent()` is synchronous and returns nothing. Add an `{ onMount }` option or a returned handle with `.onMount(fn)`.

### Important
- [ ] **No portal / teleport mechanism** `~3–4 hrs` — no way to render outside `#app`. Add a `mountPortal(component, domNode)` utility that calls `mountComponent()` into an arbitrary DOM target.
- [ ] **No `innerHTML` / `dangerouslySetInnerHTML`** `~30 min` — add one `if (k === 'innerHTML')` branch in `applyProps` in `render.js`.
- [ ] **`children` not treated as a reserved prop** `~30 min` — already bypasses validation in code; docs gap only.
- [ ] **Scaffold creates a subdirectory, not the project root** `~1–2 hrs` — add a `--root` flag to `create-solar/index.js` that sets target to `process.cwd()`.

### Nice-to-have
- [ ] **`style` prop duality undocumented** `~30 min` — docs only.
- [ ] **No router** `~1–2 days` — hash-based `#/about` → mount component routing. Net-new, nothing in codebase.
- [ ] **No `<head>` / meta management** `~1–2 hrs` — small `setMeta()` wrapper around `document.title` + meta tags.

### Docs gaps (~3–4 hrs total)
- [ ] Document hooks-in-child-components limitation (most consequential undocumented constraint)
- [ ] Document children/slots pattern — how `h()` forwards children as a prop
- [ ] Document `h()` vs `createElement()` trade-offs and when to use each
- [ ] Add third-party library integration guide (CDN loading + post-mount timing pattern)
- [ ] Add deployment guide (GitHub Pages, Netlify, Cloudflare Pages — scaffold subdirectory gotcha)
- [ ] Document `onMount` workaround (post-`mountComponent()` script ordering)

> **Sprint estimate:** ~2 days without router, ~1 week with. Fast wins: `innerHTML` prop (30 min) and `onMount` (2 hrs).
