import { createElement, useState, useEffect, defineComponent, registry, h, render } from '../framework/index.js'
import { mountComponent } from '../framework/runtime/reconciler.js'
import Counter from '../components/Counter.js'
import Button from '../components/Button.js'
import Card from '../components/Card.js'

// --- Phase 1–3: Counter with hooks ---
mountComponent(Counter, { initialCount: 0 }, document.getElementById('counter-root'))

// --- Phase 4: Contract validation error ---
const errorOutput = document.getElementById('error-output')
try {
  Button({ label: 42, onClick: () => {}, variant: 'primary' })
} catch (e) {
  errorOutput.textContent = e.toJSON
    ? JSON.stringify(e.toJSON(), null, 2)
    : e.message
}

// --- Phase 5–6: Effect + batched state updates ---
const BatchDemo = defineComponent({
  name: 'BatchDemo',
  props: {},
  render() {
    const [a, setA] = useState(0)
    const [b, setB] = useState(0)
    const [log, setLog] = useState('Waiting...')

    useEffect({
      deps: { a, b },
      run() {
        const timeout = setTimeout(() => {
          setA(v => v + 1)
          setB(v => v + 1)
          setLog(`Fetched at ${new Date().toLocaleTimeString()} — a:${a + 1} b:${b + 1}`)
        }, 1200)
        return () => clearTimeout(timeout)
      },
    })

    return createElement('div', {},
      createElement('p', { style: 'margin:0 0 0.5rem;color:#aaa;font-size:0.875rem' }, log),
      createElement('code', {}, `a=${a}  b=${b}`),
    )
  },
})

registry.register(BatchDemo)
mountComponent(BatchDemo, {}, document.getElementById('effect-root'))

// --- Phase 7: Registry manifest ---
document.getElementById('registry-output').textContent = registry.manifest()

// --- Phase 8: Compact h() notation ---
// plain DOM tree via array notation
const plainTree = h(['div', { class: 'counter' },
  ['p', { style: 'margin:0 0 0.5rem;color:#aaa;font-size:0.875rem' }, 'Built with h() — pure array notation'],
  ['div', { style: 'display:flex;gap:0.5rem' },
    ['button', { class: 'btn btn--secondary' }, '-'],
    ['button', { class: 'btn btn--primary' }, '+'],
  ],
])
render(plainTree, document.getElementById('h-root'))

// registry-aware dispatch: 'Button' string resolves to the registered component
const hButton = h(['Button', { label: 'Via h() registry dispatch', onClick: () => alert('h() works!'), variant: 'secondary' }])
render(hButton, document.getElementById('h-component-root'))

// --- Phase 9: Slots ---
// valid case
const slotValidRoot = document.getElementById('slot-valid-root')
const validCard = Card({
  title: 'Slot demo',
  body: 'This card received a typed Button in its action slot.',
  action: Button({ label: 'Action', onClick: () => alert('slot works!'), variant: 'primary' }),
})
render(validCard, slotValidRoot)

// invalid case — plain createElement has no _source tag
const slotErrorOutput = document.getElementById('slot-error-output')
try {
  Card({
    title: 'Bad card',
    body: 'This should fail.',
    action: createElement('button', { class: 'btn' }, 'Raw button'),
  })
} catch (e) {
  slotErrorOutput.textContent = e.toJSON
    ? JSON.stringify(e.toJSON(), null, 2)
    : e.message
}
