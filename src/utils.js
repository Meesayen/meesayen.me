export const lispCasify = str => str.replace(/([A-Z])/g, (str, m) => `-${m.toLowerCase()}`).slice(1)
export const camelCasify = str => str.replace(/-([a-z])?/g, (str, m) => (m || '').toUpperCase())

export const fetchText = resource => fetch(resource).then(r => r.text())
export const fetchJson = resource => fetch(resource).then(r => r.json())

// FIXME: There is currently a bug with native 'fetch' - it triggers a new download of a resources
// even if it was preloaded with <link rel="preload">
export const fetchPreloadedCss = resource => {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.open('get', resource)
    xhr.addEventListener('load', function () {
      resolve(this.responseText)
    })
    xhr.send()
  })
}

// A bit of laziness from my part
export const attachShadow = (ctx, str) => {
  const shadow = ctx.attachShadow({ mode: 'open' })
  shadow.innerHTML = str
  return shadow
}

// I am _this_ lazy 😅
export const registerElement = ElementClass => {
  // Oh yeah, it breaks with anonymous classes.
  // Oh and with class names that turn out to be non lisp-case after being lispCasified. Oh well...
  const name = lispCasify(ElementClass.name)
  customElements.define(name, ElementClass)
}

// Stupid simple UID generator - Uses a Set() to avoid collisions
// TODO: Change it to generator function
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

// Extremily simple "mixer"
export const mix = (baseClass = class {}) => {
  return {
    with(...mixins) {
      return mixins.reduce((acc, m) => m(acc), baseClass)
    }
  }
}
