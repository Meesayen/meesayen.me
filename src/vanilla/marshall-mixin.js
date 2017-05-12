// Another thing I really like from Polymer.
export default superclass => class extends superclass {
  constructor(...args) {
    super(...args)

    const handler = {
      get(target, name) {
        return target.getElementById(name)
      }
    }

    this.$ = new Proxy(this.shadowRoot, handler)
  }
}
