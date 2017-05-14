import { fetchPreloadedCss, registerElement } from '../utils.js'
import Vanilla from '../vanilla/vanilla.js'

export default class HeroBanner extends Vanilla(HTMLElement) {
  constructor() {
    super()
    this.classes = ''
    this.message = 'Click anywhere around and...'
    this.magicWord = ''
  }

  static get observedAttributes() {
    return [
      'title'
    ]
  }

  get style() {
    return fetchPreloadedCss('/elements/hero-banner.css')
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

      <div @click="clickme">
        <h1 id="title" :class="classes">
          {{title}}
        </h1>

        <br />
        <label>Compound interpolation:</label>
        <br />
        {{message}} {{magicWord}}
      </div>
    `
  }

  clickme() {
    this.message = 'Click anywhere around and'
    if (this.classes === 'be-orange') {
      this.classes = 'be-purple'
      this.magicWord = 'kazaam! ⚡️'
    } else {
      this.classes = 'be-orange'
      this.magicWord = 'presto! 🌟'
    }
  }

  titleChanged(old, nue) {
    this.title = nue
  }
}

registerElement(HeroBanner)
