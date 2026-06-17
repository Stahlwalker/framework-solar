import { createElement, useState, defineComponent } from '../framework/index.js'
import Button from './Button.js'

export default defineComponent({
  name: 'Counter',
  props: {
    initialCount: { type: 'number', default: 0 },
  },
  render({ initialCount }) {
    const [count, setCount] = useState(initialCount)

    return createElement('div', { class: 'counter' },
      createElement('p', { class: 'counter__value' }, `Count: ${count}`),
      createElement('div', { class: 'counter__controls' },
        Button({ label: '-', onClick: () => setCount(c => c - 1), variant: 'secondary' }),
        Button({ label: '+', onClick: () => setCount(c => c + 1), variant: 'primary' }),
      ),
    )
  },
})
