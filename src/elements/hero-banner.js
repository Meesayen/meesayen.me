import { fetchPreloadedCss, registerElement } from '../utils.js'
import Vanilla from '../vanilla/vanilla.js'

import './banners/out-there.js'

export default class HeroBanner extends Vanilla(HTMLElement) {
  static style = fetchPreloadedCss('/elements/hero-banner.css')

  static template = /* @vue */`
    <style unresolved>
      :host {
        display: block;
        width: 100%;
        height: 70vh;
        background: var(--c-chiaro);

      }
      :host * { @apply --cloaked; }
    </style>

    <div class="wrap">
      <out-there :state="outThereState" @click="changeState()"></out-there>

      <div class="overlay">
        <h1>
          {{message}}
        </h1>
      </div>
    </div>
  `

  static get observedAttributes() {
    return [
      'message'
    ]
  }

  constructor() {
    super()
    this.outThereState = 'on'
  }

  changeState() {
    this.outThereState = this.outThereState === 'on' ? 'off' : 'on'
  }

  messageChanged(old, nue) {
    this.message = nue
  }
}

registerElement(HeroBanner)
