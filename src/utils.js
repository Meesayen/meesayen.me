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
