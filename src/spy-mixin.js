const camelcasify = str => str.replace(/-([a-z])?/g, (str, m) => (m || '').toUpperCase())

export default superclass => class extends superclass {
  attributeChangedCallback(name, old, nue) {
    const methodName = `${camelcasify(name)}Changed`
    if (this[methodName]) {
      this[methodName](old, nue)
    }
  }
 }
