import { createElement, defineComponent } from '../framework/index.js'

export default defineComponent({
  name: 'Button',
  props: {
    label: { type: 'string', required: true },
    onClick: { type: 'function', required: true },
    variant: { type: 'string', enum: ['primary', 'secondary'], default: 'primary' },
  },
  render({ label, onClick, variant }) {
    return createElement('button', { class: `btn btn--${variant}`, onclick: onClick }, label)
  },
})
