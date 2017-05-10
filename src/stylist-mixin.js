import { attachShadow } from './utils.js'

export default superclass => class extends superclass {
  constructor(...args) {
    super(...args)
    this.root = attachShadow(this, /* @html */`
      <style>
         :host { opacity: 0; }
         *, * + * { opacity: 0; }
      </style>
      ${this.template}
    `)

    ;(async () => {
      this.root.querySelector('style').textContent = await this.style
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
