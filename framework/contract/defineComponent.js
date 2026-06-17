import { validateProps } from './validate.js'

export function defineComponent(config) {
  const { name, props: propSchema = {}, render } = config

  if (!name) throw new Error('defineComponent: "name" is required')
  if (!render) throw new Error(`defineComponent(${name}): "render" is required`)

  function ComponentFn(rawProps = {}) {
    const resolvedProps = validateProps(name, propSchema, rawProps)
    return render(resolvedProps)
  }

  ComponentFn.displayName = name
  ComponentFn._schema = propSchema
  ComponentFn._isComponent = true

  return ComponentFn
}
