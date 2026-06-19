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
- [ ] Create solarbuild.dev homepage (currently redirects to docs)

### Nice-to-have
- [x] Add CHANGELOG (v0.1.0 baseline)
- [x] Add CONTRIBUTING.md
- [x] Improve README quick-start with a full runnable HTML+browser snippet
- [x] Fix "nine build phases" copy in README — there are 7 phases, the demo has 9 sections
