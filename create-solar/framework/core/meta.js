export function setMeta({ title, description, og = {} } = {}) {
  if (title !== undefined) {
    document.title = title
    setMetaTag('og:title', title)
  }
  if (description !== undefined) {
    setMetaTag('description', description)
    setMetaTag('og:description', description)
  }
  if (og.image !== undefined) setMetaTag('og:image', og.image)
  if (og.url !== undefined) setMetaTag('og:url', og.url)
  if (og.type !== undefined) setMetaTag('og:type', og.type)
}

function setMetaTag(name, content) {
  const isOg = name.startsWith('og:')
  const attr = isOg ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
