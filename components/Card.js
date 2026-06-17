import { createElement, defineComponent, registry } from '../framework/index.js'

const Card = defineComponent({
  name: 'Card',
  props: {
    title: { type: 'string', required: true },
    body: { type: 'string', required: true },
    action: { type: 'slot', accepts: 'Button', required: true },
  },
  render({ title, body, action }) {
    return createElement('div', { class: 'card' },
      createElement('h3', { class: 'card__title' }, title),
      createElement('p', { class: 'card__body' }, body),
      createElement('div', { class: 'card__action' }, action),
    )
  },
})

registry.register(Card)
export default Card
