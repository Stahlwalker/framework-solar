# Contributing

## Reporting issues

Open a GitHub issue. Include:
- What you expected to happen
- What actually happened (paste the full `ContractError` JSON if applicable)
- A minimal reproduction

## Setup

After cloning, activate the shared git hooks:

```bash
git config core.hooksPath .githooks
```

This enables a pre-commit hook that warns if you change `docs/api/` or `framework/` without updating `llms-full.txt`. Use `git commit --no-verify` to skip if you intentionally want to defer the update.

## Pull requests

1. Fork the repo and create a branch from `main`
2. Keep changes focused — one concern per PR
3. Don't add a compiler, SSR, routing, or build pipeline — Solar is intentionally runtime-only
4. Run the demo locally to verify nothing regressed (`npm run dev`, open `http://localhost:3456/demo/`)
5. Open the PR with a clear description of what changed and why

## Design constraints

Solar's surface area is intentionally small. Before adding a new primitive, ask: can an AI-code-generation target reliably use this without ambiguity? If not, it probably doesn't belong here.

Hooks must follow the same object-form pattern as the existing ones — explicit `deps`, no magic. Components must be definable via `defineComponent` with a fully declarable prop schema.

## Commit style

```
fix: correct AbortController cleanup in useResource
feat: add useLocalStorage hook
docs: clarify slot prop behavior in README
```

Type prefixes: `feat`, `fix`, `docs`, `refactor`, `test`. Keep the subject line under 72 characters.
