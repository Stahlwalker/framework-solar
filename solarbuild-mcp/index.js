#!/usr/bin/env node
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
  'Returns the full component registry as JSON — call this before generating any Solar component code',
  { componentsPath: z.string().describe('Path to the components directory, relative to the project root') },
  async ({ componentsPath }) => {
    await loadComponents(componentsPath)
    return {
      content: [{ type: 'text', text: registry.manifest() }],
    }
  }
)

server.tool(
  'component',
  'Returns the schema for a single component by name',
  { name: z.string().describe('The component name, e.g. "Button"') },
  async ({ name }) => {
    const all = JSON.parse(registry.manifest())
    const component = all.find(c => c.name === name)
    if (!component) {
      return {
        content: [{ type: 'text', text: `Component "${name}" not found in registry. Call manifest first to load components.` }],
        isError: true,
      }
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(component, null, 2) }],
    }
  }
)

server.tool(
  'validate',
  'Validates a props object against a component schema without mounting — returns errors with fix instructions',
  {
    name: z.string().describe('The component name'),
    props: z.record(z.unknown()).describe('The props object to validate'),
  },
  async ({ name, props }) => {
    const all = JSON.parse(registry.manifest())
    const component = all.find(c => c.name === name)
    if (!component) {
      return {
        content: [{ type: 'text', text: `Component "${name}" not found in registry.` }],
        isError: true,
      }
    }

    const errors = []
    for (const [key, schema] of Object.entries(component.props)) {
      const value = props[key]
      if (schema.required && (value === undefined || value === null)) {
        errors.push({ prop: key, expected: schema.type, received: 'undefined', fix: `Provide a value for the required prop "${key}"` })
        continue
      }
      if (value === undefined || value === null) continue
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push({ prop: key, expected: `one of [${schema.enum.join(', ')}]`, received: value, fix: `Use one of the allowed values: ${schema.enum.join(', ')}` })
        continue
      }
      if (schema.type !== 'any' && typeof value !== schema.type) {
        errors.push({ prop: key, expected: schema.type, received: typeof value, fix: `Pass a ${schema.type} value for "${key}"` })
      }
    }

    if (errors.length === 0) {
      return { content: [{ type: 'text', text: JSON.stringify({ valid: true }) }] }
    }
    return { content: [{ type: 'text', text: JSON.stringify({ valid: false, errors }, null, 2) }] }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
