import { registerElement } from '../utils.js'
import Vanilla from '../vanilla/vanilla.js'

export default class HeroBanner extends Vanilla(HTMLElement) {
  constructor() {
    super()
    this.classes = 'cls1 cls2 cls3'
    this.other = 'ciao'
  }

  static get observedAttributes() {
    return [
      'title'
    ]
  }

  get style() {
    return fetch('elements/hero-banner.css').then(r => r.text())
  }

  get template() {
    return /* @vue */`
      <style unresolved>
        :host {
          display: block;
          width: 100%;
          height: 70vh;
          background: var(--c-chiaro);

        }
        :host * { @apply --cloaked; }
      </style>

      <div @click="clickme()">
        <h1 id="title" :class="classes">
          compound [{{title}}] interpolation [{{title}}] magic [{{other}}]
          <span></span>
          [{{title}}]
        </h1>
      </div>
    `
  }

  clickme(title) {
    console.log('ciaooooo', title)
    if (this.classes === 'no class') {
      this.classes = 'eeee classes'
      this.other = 'kazaam! ⚡️'
    } else {
      this.classes = 'no class'
      this.other = 'presto! 🌟'
    }
  }

  titleChanged(old, nue) {
    this.title = nue
  }
}

registerElement(HeroBanner)
