# solarbuild-mcp

An MCP server that exposes Solar's component registry as a callable tool, so AI agents can introspect available components at runtime without reading docs.

## Why

Solar's core value prop is `registry.manifest()` — a machine-readable JSON schema of every registered component. Right now agents can only learn about it from documentation. With an MCP server, agents can call it directly during a session, discovering components on demand the same way a developer would call an API.

---

## Package location

Add as a new package in the monorepo at `create-solar/` level:

```
framework-solar/
├── framework/          # solarbuild (existing)
├── create-solar/       # create-solarbuild (existing)
└── solarbuild-mcp/     # new
    ├── index.js
    ├── package.json
    └── README.md
```

---

## Tools to expose

### `manifest` (required)
Returns the full component registry as JSON.

**Input:** path to a components directory or entry file (e.g. `./components`)  
**Behavior:** dynamically imports all `.js` files in the directory, which self-register via `registry.register()` on import, then calls `registry.manifest()` and returns the result.  
**Output:**
```json
[
  {
    "name": "Button",
    "props": {
      "label": { "type": "string", "required": true },
      "variant": { "type": "string", "enum": ["primary", "secondary"], "default": "primary" }
    }
  }
]
```

### `component` (stretch)
Returns the schema for a single component by name.

**Input:** component name (string)  
**Output:** same shape as one entry in `manifest`, or an error if not found.

### `validate` (stretch)
Checks a props object against a component's schema without mounting.

**Input:** component name + props object  
**Output:** `{ valid: true }` or `{ valid: false, errors: [ContractError, ...] }`

---

## Config

Agent points the server at components via a config file or CLI flag:

```js
// solar-mcp.config.js
export default {
  components: './components',  // directory or glob
}
```

Or via CLI:

```bash
npx solarbuild-mcp --components ./components
```

---

## MCP server implementation

Use the official `@modelcontextprotocol/sdk` package.

```js
// solarbuild-mcp/index.js
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { registry } from 'solarbuild'
import { loadComponents } from './loader.js'

const server = new McpServer({
  name: 'solarbuild-mcp',
  version: '0.1.0',
})

server.tool(
  'manifest',
  { componentsPath: z.string().describe('Path to components directory or entry file') },
  async ({ componentsPath }) => {
    await loadComponents(componentsPath)
    return {
      content: [{ type: 'text', text: registry.manifest() }],
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
```

### Component loader

```js
// solarbuild-mcp/loader.js
import { readdir } from 'fs/promises'
import { resolve, join } from 'path'

export async function loadComponents(dir) {
  const absDir = resolve(process.cwd(), dir)
  const files = await readdir(absDir)
  const jsFiles = files.filter(f => f.endsWith('.js'))
  await Promise.all(jsFiles.map(f => import(join(absDir, f))))
}
```

---

## package.json

```json
{
  "name": "solarbuild-mcp",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "solarbuild-mcp": "./index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "solarbuild": "*",
    "zod": "^3.0.0"
  }
}
```

---

## Cursor / Claude config

After install, users add to their MCP config:

```json
{
  "mcpServers": {
    "solarbuild": {
      "command": "npx",
      "args": ["solarbuild-mcp", "--components", "./components"]
    }
  }
}
```

---

## Build order

1. Scaffold `solarbuild-mcp/` package with `package.json` and empty `index.js`
2. Implement `loadComponents()` loader
3. Implement `manifest` tool with MCP SDK
4. Test locally by pointing at `framework-solar/components/`
5. Add `component` and `validate` tools
6. Publish to npm as `solarbuild-mcp`
7. Submit to MCP registries (glama.ai, mcp.so)
8. Add to Solar docs and README

---

## Open questions

- Should `loadComponents` support globs in addition to a flat directory? (e.g. `components/**/*.js`)
- Should the server re-import on each call (stateless) or cache the registry between calls?
- Does `solarbuild` need to be a peer dependency, or bundled?
