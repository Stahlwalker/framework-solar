import {
  defineComponent,
  mountComponent,
  registry,
  createElement,
  ContractError,
} from 'solarbuild'

// ── Component ──────────────────────────────────────────────────────────────────

const Button = defineComponent({
  name: 'Button',
  props: {
    label:   { type: 'string',   required: true },
    onClick: { type: 'function', required: true },
    variant: { type: 'string',   enum: ['primary', 'secondary'], default: 'primary' },
  },
  render({ label, onClick, variant }) {
    return createElement('button', { class: `btn btn--${variant}`, onclick: onClick }, label)
  },
})

registry.register(Button)

// ── Collect real data ──────────────────────────────────────────────────────────

const manifestData = JSON.parse(registry.manifest())

let contractError = null
try {
  mountComponent(Button, { label: 42, onClick: () => {} }, document.createElement('div'))
} catch (e) {
  if (e instanceof ContractError) contractError = e.toJSON()
}

// ── JSON syntax highlighter ───────────────────────────────────────────────────

function highlightJSON(obj) {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map(line => {
      const m = line.match(/^(\s*)("[\w]+"):\s*(.+)$/)
      if (!m) return escHtml(line)
      const [, indent, rawKey, rest] = m
      const key = `<span class="key">${escHtml(rawKey)}</span>`
      const comma = rest.endsWith(',') ? ',' : ''
      const val = rest.replace(/,$/, '')
      const isFix = rawKey === '"fix"'
      const isErr = rawKey === '"error"'
      let highlighted = val
      if (val.startsWith('"')) {
        const cls = isFix ? 'fix-val' : isErr ? 'err-val' : 'str'
        highlighted = `<span class="${cls}">${escHtml(val)}</span>`
      } else if (val === 'true' || val === 'false' || val === 'null') {
        highlighted = `<span class="bool">${val}</span>`
      } else if (/^\d/.test(val)) {
        highlighted = `<span class="num">${val}</span>`
      }
      return `${indent}${key}: ${highlighted}${comma}`
    })
    .join('\n')
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Steps ─────────────────────────────────────────────────────────────────────

const steps = [
  {
    label: 'Discover',
    code: [
      '<span class="comment">// What components exist? What props do they take?</span>',
      '<span class="kw">const</span> schema = registry.<span class="fn">manifest</span>()',
    ].join('\n'),
    renderResult(el) {
      el.innerHTML = `<pre>${highlightJSON(manifestData)}</pre>`
    },
  },
  {
    label: 'Mount',
    code: [
      '<span class="comment">// Agent uses schema to call mountComponent</span>',
      '<span class="fn">mountComponent</span>(Button, {',
      '  label:   <span class="num">42</span>,   <span class="comment">// ← wrong type</span>',
      '  onClick: handleClick,',
      '}, container)',
    ].join('\n'),
    renderResult(el) {
      el.innerHTML = `<div class="badge badge--error">ContractError</div><pre>${highlightJSON(contractError)}</pre>`
    },
  },
  {
    label: 'Fix',
    code: [
      '<span class="comment">// Agent reads error.fix, retries with corrected props</span>',
      '<span class="fn">mountComponent</span>(Button, {',
      '  label:   <span class="str">"Deploy to production"</span>,',
      '  onClick: handleClick,',
      '}, container)',
    ].join('\n'),
    renderResult(el) {
      el.innerHTML = '<div class="badge badge--success">Rendered</div>'
      const container = document.createElement('div')
      el.appendChild(container)
      mountComponent(Button, {
        label: 'Deploy to production',
        onClick: () => {},
        variant: 'primary',
      }, container)
    },
  },
]

// ── UI ────────────────────────────────────────────────────────────────────────

let current = 0
let timer = null

const stepsEl   = document.getElementById('steps')
const progressEl = document.getElementById('progress')
const agentEl   = document.getElementById('agent-code')
const resultEl  = document.getElementById('result-body')

steps.forEach((s, i) => {
  const pill = document.createElement('button')
  pill.className = 'step-pill'
  pill.textContent = s.label
  pill.onclick = () => goTo(i)
  stepsEl.appendChild(pill)
})

function goTo(i) {
  current = i
  clearTimeout(timer)

  stepsEl.querySelectorAll('.step-pill').forEach((p, idx) => {
    p.classList.toggle('active', idx === i)
  })

  agentEl.innerHTML = steps[i].code
  resultEl.innerHTML = ''
  steps[i].renderResult(resultEl)

  progressEl.classList.remove('running')
  void progressEl.offsetWidth
  progressEl.classList.add('running')

  timer = setTimeout(() => goTo((i + 1) % steps.length), 4000)
}

goTo(0)
