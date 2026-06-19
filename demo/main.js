import {
  createElement, useState, useResource, useSubscription, onMount, onUnmount,
  defineComponent, registry, h, render,
} from '../framework/index.js'
import { mountComponent } from '../framework/runtime/reconciler.js'
import Counter from '../components/Counter.js'
import Button from '../components/Button.js'
import Card from '../components/Card.js'

// --- Phase 1–3: Counter with hooks ---
mountComponent(Counter, { initialCount: 0 }, document.getElementById('counter-root'))

// --- Phase 4: Structured ContractError ---
const errorOutput = document.getElementById('error-output')
try {
  Button({ label: 42, onClick: () => {}, variant: 'primary' })
} catch (e) {
  errorOutput.textContent = e.toJSON
    ? JSON.stringify(e.toJSON(), null, 2)
    : e.message
}

// --- Phase 5: useResource — async fetching with cancellation ---
const ResourceDemo = defineComponent({
  name: 'ResourceDemo',
  props: {},
  render() {
    const [userId, setUserId] = useState(1)

    const { data, loading, error } = useResource({
      key: userId,
      fetch: async (signal) => {
        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, 700)
          signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')) })
        })
        return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` }
      },
    })

    const status = loading
      ? 'Loading...'
      : error
        ? `Error: ${error.message}`
        : `${data.name} — ${data.email}`

    return createElement('div', {},
      createElement('p', { style: 'margin:0 0 1rem;font-size:0.875rem;color:#aaa' }, status),
      createElement('div', { style: 'display:flex;gap:0.5rem' },
        Button({ label: '← Prev', onClick: () => setUserId(id => Math.max(1, id - 1)), variant: 'secondary' }),
        Button({ label: 'Next →', onClick: () => setUserId(id => id + 1), variant: 'primary' }),
      ),
    )
  },
})

registry.register(ResourceDemo)
mountComponent(ResourceDemo, {}, document.getElementById('resource-root'))

// --- Phase 6: useSubscription + lifecycle ---
const LifecycleDemo = defineComponent({
  name: 'LifecycleDemo',
  props: {},
  render() {
    const [width, setWidth] = useState(window.innerWidth)
    const [log, setLog] = useState([])

    onMount(() => setLog(l => [...l, 'mounted']))
    onUnmount(() => setLog(l => [...l, 'unmounted']))

    useSubscription({
      source: window,
      event: 'resize',
      handler: () => setWidth(window.innerWidth),
    })

    return createElement('div', {},
      createElement('p', { style: 'margin:0 0 0.5rem;font-size:0.875rem;color:#aaa' },
        `Window width: ${width}px`
      ),
      createElement('p', { style: 'margin:0;font-size:0.875rem;color:#555' },
        `Lifecycle: ${log.join(' → ')}`
      ),
    )
  },
})

registry.register(LifecycleDemo)
mountComponent(LifecycleDemo, {}, document.getElementById('lifecycle-root'))

// --- Phase 7: Registry manifest ---
document.getElementById('registry-output').textContent = registry.manifest()

// --- Phase 8: Compact h() notation ---
render(
  h(['div', { style: 'display:flex;flex-direction:column;gap:0.75rem' },
    ['p', { style: 'margin:0;font-size:0.875rem;color:#aaa' }, 'Built with h() — pure array notation'],
    ['div', { style: 'display:flex;gap:0.5rem' },
      ['button', { class: 'btn btn--secondary' }, '-'],
      ['button', { class: 'btn btn--primary' }, '+'],
    ],
  ]),
  document.getElementById('h-root')
)

render(
  h(['Button', { label: 'Via h() registry dispatch', onClick: () => alert('h() works!'), variant: 'secondary' }]),
  document.getElementById('h-component-root')
)

// --- Phase 9: Slots ---
render(
  Card({
    title: 'Slot demo',
    body: 'This card received a typed Button in its action slot.',
    action: Button({ label: 'Action', onClick: () => alert('slot works!'), variant: 'primary' }),
  }),
  document.getElementById('slot-valid-root')
)

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
