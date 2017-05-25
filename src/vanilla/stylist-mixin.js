import { attachShadow } from '../utils.js'

export default superclass => class StylistMixin extends superclass {
  static template = /* @html */`
    <h1>Please override the 'static get template()' method, and provide your own template</h1>
  `

  static style = null

  constructor(...args) {
    super(...args)

    // Maybe I should make this a getter instead.
    this.root = attachShadow(this, this.constructor.template)

    ;(async () => {
      let style = this.root.querySelector('style[unresolved]')
      if (style === null) {
        style = document.createElement('style')
        this.root.appendChild(style)
      } else {
        style.removeAttribute('unresolved')
      }
      style.textContent = await this.constructor.style

      // Useful hook to do computation after the injection of the asynchronously fetched style
      if (typeof this.ready === 'function') {
        this.ready()
      }
    })()
  }
}
