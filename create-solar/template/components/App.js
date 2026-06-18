import { defineComponent, createElement, useState, registry } from '../solar/index.js'

const App = defineComponent({
  name: 'App',
  props: {},
  render() {
    const [count, setCount] = useState(0)

    return createElement('div', {},
      createElement('h1', {}, '{{PROJECT_NAME}}'),
      createElement('p', {}, `Count: ${count}`),
      createElement('button', { class: 'btn btn--primary', onclick: () => setCount(c => c + 1) }, '+'),
      createElement('button', { class: 'btn btn--secondary', onclick: () => setCount(c => c - 1) }, '-'),
    )
  },
})

registry.register(App)
export default App
