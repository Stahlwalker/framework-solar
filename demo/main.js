import { createElement, useState, useEffect, defineComponent } from '../framework/index.js'
import { mountComponent } from '../framework/runtime/reconciler.js'
import Counter from '../components/Counter.js'
import Button from '../components/Button.js'

// Phase 1–3: Counter with hooks
mountComponent(Counter, { initialCount: 0 }, document.getElementById('counter-root'))

// Phase 4: Contract validation error display
const errorOutput = document.getElementById('error-output')
try {
  Button({ label: 42, onClick: () => {}, variant: 'primary' })
} catch (e) {
  errorOutput.textContent = e.message
}

// Phase 5–6: Effect + batched state updates
const BatchDemo = defineComponent({
  name: 'BatchDemo',
  props: {},
  render() {
    const [a, setA] = useState(0)
    const [b, setB] = useState(0)
    const [log, setLog] = useState('Waiting for fetch...')

    useEffect({
      deps: { a, b },
      run() {
        // simulate fetch that updates two pieces of state — should produce one render
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

mountComponent(BatchDemo, {}, document.getElementById('effect-root'))
