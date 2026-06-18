import { defineComponent, createElement, useState, registry } from '../solar/index.js'

const App = defineComponent({
  name: 'App',
  props: {},
  render() {
    const [count, setCount] = useState(0)

    return createElement('div', { class: 'card' },
      createElement('p', { class: 'card__label' }, 'Counter — edit me'),
      createElement('div', { class: 'card__count' }, String(count)),
      createElement('div', { class: 'card__controls' },
        createElement('button', { class: 'btn btn--primary', onclick: () => setCount(c => c + 1) }, '+'),
        createElement('button', { class: 'btn btn--secondary', onclick: () => setCount(c => c - 1) }, '−'),
      ),
    )
  },
})

registry.register(App)
export default App
