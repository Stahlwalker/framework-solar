export function createElement(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat().filter(c => c !== null && c !== undefined && c !== false),
  }
}
