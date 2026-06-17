export class ContractError extends Error {
  constructor({ component, prop, expected, received, fix }) {
    const propPart = prop ? ` prop "${prop}":` : ''
    super(`${component}:${propPart} expected ${expected}, got ${received}`)
    this.name = 'ContractError'
    this.component = component
    this.prop = prop
    this.expected = expected
    this.received = received
    this.fix = fix
  }

  toJSON() {
    return {
      error: 'ContractError',
      component: this.component,
      prop: this.prop,
      expected: this.expected,
      received: this.received,
      fix: this.fix,
      message: this.message,
    }
  }
}
