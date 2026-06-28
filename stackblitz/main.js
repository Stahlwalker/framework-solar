import {
  defineComponent,
  mountComponent,
  registry,
  createElement,
  ContractError,
} from 'solarbuild'

// ── Component definition ──────────────────────────────────────────────────────

const Button = defineComponent({
  name: 'Button',
  props: {
    label:   { type: 'string',   required: true },
    onClick: { type: 'function', required: true },
    variant: { type: 'string',   enum: ['primary', 'secondary'], default: 'primary' },
  },
  render({ label, onClick, variant }) {
    return createElement(
      'button',
      { class: `btn btn--${variant}`, onclick: onClick },
      label,
    )
  },
})

registry.register(Button)

// ── Working mount ─────────────────────────────────────────────────────────────

mountComponent(
  Button,
  { label: 'Deploy to production', onClick: () => alert('Deployed!'), variant: 'primary' },
  document.getElementById('working'),
)

// ── Bad mount: label is a number, not a string ────────────────────────────────

try {
  mountComponent(
    Button,
    { label: 42, onClick: () => {}, variant: 'secondary' },
    document.getElementById('error'),
  )
} catch (e) {
  if (e instanceof ContractError) {
    const err = e.toJSON()
    renderErrorCard(err, document.getElementById('error'))
  }
}

// ── Error display ─────────────────────────────────────────────────────────────

function renderErrorCard(err, container) {
  const fields = ['error', 'component', 'prop', 'expected', 'received', 'fix', 'message']

  const rows = fields
    .filter(k => err[k] !== undefined)
    .map(k => {
      const valueClass = k === 'fix' ? 'fix' : 'value'
      return `<div><span class="key">"${k}"</span>: <span class="${valueClass}">"${err[k]}"</span></div>`
    })
    .join('\n')

  container.innerHTML = `
    <div class="error-card">
      <div class="error-card__header">
        <span class="error-badge">ContractError</span>
        <span class="error-card__title">${err.component}: prop "${err.prop}"</span>
      </div>
      <div class="error-card__body">${rows}</div>
    </div>
  `
}
