export const Types = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  function: 'function',
  object: 'object',
  array: 'array',
  any: 'any',
}

export function checkType(name, value, schema) {
  if (schema.required && (value === undefined || value === null)) {
    throw new Error(`${name}: prop "${schema._key}" is required but was not provided`)
  }

  if (value === undefined || value === null) return // optional and absent — fine

  const expected = schema.type

  if (expected === Types.any) return

  if (expected === Types.array) {
    if (!Array.isArray(value)) {
      throw new Error(`${name}: expected "${schema._key}" to be array, got ${typeof value}`)
    }
    return
  }

  if (typeof value !== expected) {
    throw new Error(`${name}: expected "${schema._key}" to be ${expected}, got ${typeof value}`)
  }

  if (schema.enum && !schema.enum.includes(value)) {
    throw new Error(
      `${name}: "${schema._key}" must be one of [${schema.enum.map(v => `"${v}"`).join(', ')}], got "${value}"`
    )
  }
}
