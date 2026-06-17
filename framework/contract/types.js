import { ContractError } from './ContractError.js'

export const Types = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  function: 'function',
  object: 'object',
  array: 'array',
  any: 'any',
  slot: 'slot',
}

export function checkType(componentName, value, schema) {
  const { _key: prop, type: expected } = schema

  if (schema.required && (value === undefined || value === null)) {
    throw new ContractError({
      component: componentName,
      prop,
      expected: `a value (required)`,
      received: 'undefined',
      fix: `Provide a value for the required prop "${prop}"`,
    })
  }

  if (value === undefined || value === null) return

  if (expected === Types.any) return

  if (expected === Types.slot) {
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new ContractError({
        component: componentName,
        prop,
        expected: schema.accepts ? `slot(${schema.accepts})` : 'a vnode (slot)',
        received: typeof value,
        fix: `Pass a rendered component vnode for "${prop}"`,
      })
    }
    if (schema.accepts && value._source !== schema.accepts) {
      throw new ContractError({
        component: componentName,
        prop,
        expected: `slot(${schema.accepts})`,
        received: value._source ? `slot(${value._source})` : 'vnode with no _source (plain createElement)',
        fix: `Pass a vnode produced by the ${schema.accepts} component`,
      })
    }
    return
  }

  if (expected === Types.array) {
    if (!Array.isArray(value)) {
      throw new ContractError({
        component: componentName,
        prop,
        expected: 'array',
        received: typeof value,
        fix: `Pass an array for "${prop}"`,
      })
    }
    return
  }

  if (typeof value !== expected) {
    throw new ContractError({
      component: componentName,
      prop,
      expected,
      received: typeof value,
      fix: `Pass a ${expected} value for "${prop}"`,
    })
  }

  if (schema.enum && !schema.enum.includes(value)) {
    throw new ContractError({
      component: componentName,
      prop,
      expected: `one of [${schema.enum.map(v => `"${v}"`).join(', ')}]`,
      received: `"${value}"`,
      fix: `Use one of the allowed values: ${schema.enum.join(', ')}`,
    })
  }
}
