import { attachShadow } from '../utils.js'

export default superclass => class StylistMixin extends superclass {
  constructor(...args) {
    super(...args)

    // Maybe I should make this a getter instead.
    this.root = attachShadow(this, this.template)

    ;(async () => {
      let style = this.root.querySelector('style[unresolved]')
      if (style === null) {
        style = document.createElement('style')
        this.root.appendChild(style)
      } else {
        style.removeAttribute('unresolved')
      }
      style.textContent = await this.style

      // Useful hook to do computation after the injection of the asynchronously fetched style
      if (typeof this.ready === 'function') {
        this.ready()
      }
    })()
  }

  get template() {
    const msg = 'You should override the `get template()` method, and provide your own template'
    console.log(msg)
    return /* @html */`
      <h1>${msg}</h1>
    `
  }

  get style() {
    const msg = 'You should override the `get style()` method, and provide your own style'
    console.log(msg)
    return ''
  }
}
