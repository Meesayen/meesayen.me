import { registerElement } from '../utils.js'
import stylist from '../stylist-mixin.js'
import spy from '../spy-mixin.js'
import marshall from '../marshall-mixin.js'

export default class HeroBanner extends marshall(spy(stylist(HTMLElement))) {
  static get observedAttributes() {
    return [
      'title'
    ]
  }

  get style() {
    return fetch('elements/hero-banner.css').then(r => r.text())
  }

  get template() {
    return /* @html */`
      <div>
        <h1 id="title">
          ${this.title}
        </h1>
      </div>
    `
  }

  titleChanged(old, nue) {
    this.$.title.textContent = nue
  }
}

registerElement(HeroBanner)
