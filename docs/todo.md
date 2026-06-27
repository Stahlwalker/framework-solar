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

---

## SEO & Discovery

### Done
- [x] `robots.txt` — allow all crawlers including AI agents (GPTBot, ClaudeBot, PerplexityBot, etc.), references sitemap
- [x] `llms.txt` — AEO file summarizing Solar for LLMs with links to all doc pages and npm packages
- [x] `sitemap.xml` — all 11 pages with priorities; served at `docs.solarbuild.dev/sitemap.xml`

### To Do
- [x] **Google Search Console** — verified `docs.solarbuild.dev`; sitemap submitted
- [x] **Google Search Console** — verified `solarbuild.dev` separately
- [x] **Bing Webmaster Tools** — imported from GSC; sitemap included
- [x] **Ahrefs project** — created with `docs.solarbuild.dev`
- [x] **Add `llms.txt` to `solarbuild.dev`** — added to solar-site repo
- [x] **`llms-full.txt`** — full API reference with all signatures, examples, and error formats inline
- [x] **Open Graph meta tags** — added to `solarbuild.dev` homepage
- [x] **Structured data (JSON-LD)** — added `SoftwareApplication` schema to `solarbuild.dev` homepage

---

## AI-Era Devtools (from blog checklist)

### Documentation
- [x] **Document structured errors with recovery steps** — each error code in Solar should have a documented cause and fix, not just a message
- [x] **Agent-focused quickstart** — a dedicated guide or section showing how an AI agent would use Solar (discover components via `registry.manifest()`, mount, handle errors)

### Discoverability & Ecosystem
- [ ] **Submit to AI coding tool directories** — add Solar to Cursor rules directories, `.cursorrules` community lists, and Copilot extension ecosystems
- [ ] **List in MCP registries** — submit to MCP server/tool registries so agents can find Solar
- [ ] **MCP server wrapping `registry.manifest()`** — expose Solar's component registry as an MCP tool so agents can introspect available components at runtime (bigger lift, high payoff for Solar's core value prop)

### Content
- [ ] **Technical blog posts** — write concrete developer content: "Using Solar with Claude", "Building agent UIs with Solar", "How Solar's registry.manifest() works"

---

## Docs quality (lessons from React, Vue, Stripe)

- [ ] **Live embed on Introduction** — embed a StackBlitz with a 10-line Counter (defineComponent + useState + mountComponent) so visitors see Solar run without installing anything
- [ ] **"Pick your path" block on Introduction** — two cards: "I want to build something" → Installation, "I'm an AI agent" → Agent Quickstart
- [ ] **Rewrite Introduction opener** — lead with outcome: "Solar lets an AI agent generate a working UI component in one call — typed contracts, structured errors, and a machine-readable registry included"
- [ ] **Prerequisites line on Installation** — add one sentence: "Requires basic JavaScript. No bundler, no build step."
- [ ] **"Next steps" block at bottom of Installation** — page currently dead-ends; add links to defineComponent API, Agent Quickstart, and Building a Site
- [ ] **Reorganize sidebar by intent** — consider Getting Started → Build Something (Guides) → Reference (API) instead of burying Guides after API Reference

---

## Mintlify improvements

- [x] **`topbarCta`** — add a primary CTA button in the top bar (e.g. "Get Started" linking to installation)
- [x] **`og:image`** — set a social card image via `metadata` so link previews on Twitter/Slack show something
- [x] **`anchors`** — added then removed; redundant with topbar links on a lean docs site
- [x] **`feedback`** — enable the "Was this page helpful?" widget
- [x] **Analytics** — wire PostHog into the `analytics` block in mint.json
