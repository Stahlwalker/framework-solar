# VitePress Docs Setup

When you're ready to publish Solar's documentation as a real site, VitePress is the recommended platform. It's what Vue, Vite, and Rollup use — free, static output, deploys to Vercel or GitHub Pages in minutes.

This doc is a reference for when you're ready to set it up. Nothing here is required now.

---

## Why VitePress

- Free and self-hosted — no platform dependency
- Writes docs in Markdown, same as the current `docs/` files
- Static output deploys anywhere (Vercel, GitHub Pages, Netlify)
- Fast search, dark mode, mobile-friendly out of the box
- Used by Vue, Vite, Rollup, Vitest — credible in the JS ecosystem

---

## Setup (when ready)

```bash
# From the repo root
npm install -D vitepress

# Scaffold the docs site
npx vitepress init
```

When prompted:
- Root: `./docs`
- Site title: `Solar`
- Site description: `A runtime framework for AI-generated code`
- Theme: Default

Then add the dev and build scripts to `package.json`:

```json
"scripts": {
  "docs:dev": "vitepress dev docs",
  "docs:build": "vitepress build docs",
  "docs:preview": "vitepress preview docs"
}
```

Run locally:

```bash
npm run docs:dev
```

---

## Recommended doc structure

Map the existing markdown files into a sidebar:

```
docs/
├── .vitepress/
│   └── config.js        # site config and sidebar
├── index.md             # landing page
├── installation.md      # already written
├── use-cases.md         # already written
├── api/
│   ├── define-component.md
│   ├── hooks.md
│   ├── h.md
│   └── registry.md
└── guides/
    ├── your-first-component.md
    └── working-with-agents.md
```

---

## VitePress config

```js
// docs/.vitepress/config.js
export default {
  title: 'Solar',
  description: 'A runtime framework for AI-generated code',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/installation' },
      { text: 'API', link: '/api/define-component' },
      { text: 'GitHub', link: 'https://github.com/Stahlwalker/framework-solar' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Use Cases', link: '/use-cases' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'defineComponent', link: '/api/define-component' },
          { text: 'Hooks', link: '/api/hooks' },
          { text: 'h()', link: '/api/h' },
          { text: 'Registry', link: '/api/registry' },
        ],
      },
    ],
  },
}
```

---

## Deploy to Vercel

Add a `vercel.json` at the repo root:

```json
{
  "buildCommand": "npm run docs:build",
  "outputDirectory": "docs/.vitepress/dist"
}
```

Then `vercel --prod` or connect the repo in the Vercel dashboard. Deploys automatically on every push to `main`.

---

## Deploy to GitHub Pages

Add `.github/workflows/docs.yml`:

```yaml
name: Deploy docs
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```
