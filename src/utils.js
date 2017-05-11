export const lispCasify = str => str.replace(/([A-Z])/g, (str, m) => `-${m.toLowerCase()}`).slice(1)

export const attachShadow = (ctx, str) => {
  const shadow = ctx.attachShadow({ mode: 'open' })
  shadow.innerHTML = str
  return shadow
}

export const registerElement = ElementClass => {
  const name = lispCasify(ElementClass.name)
  customElements.define(name, ElementClass)
}

export const camelcasify = str => str.replace(/-([a-z])?/g, (str, m) => (m || '').toUpperCase())

const UIDList = new Set()
const seed = 'abcdefghijklmnopqrstvwxyz1234567890'
let prevUIDListSize = UIDList.size
export const genUID = () => {
  const chars = []
  for (let i = 0; i < 5; i++) {
    chars.push(seed[Math.floor(Math.random() * seed.length)])
  }
  const newUID = chars.join('')

  // Easy collision check
  UIDList.add(newUID)
  if (UIDList.size === prevUIDListSize) return genUID()

  prevUIDListSize = UIDList.size
  return newUID
}

export const mix = baseClass => {
  return {
    with(mixins) {
      return mixins.reduce((acc, m) => m(acc), baseClass)
    }
  }
}
