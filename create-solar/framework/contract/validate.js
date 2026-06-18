import { checkType } from './types.js'

export function validateProps(componentName, propSchema, props) {
  const resolved = {}

  for (const [key, schema] of Object.entries(propSchema)) {
    const value = props[key]
    checkType(componentName, value, { ...schema, _key: key })

    if (value === undefined && schema.default !== undefined) {
      resolved[key] = schema.default
    } else {
      resolved[key] = value
    }
  }

  // warn on unknown props
  for (const key of Object.keys(props)) {
    if (!(key in propSchema)) {
      console.warn(`${componentName}: unknown prop "${key}" passed but not declared in schema`)
    }
  }

  return resolved
}
