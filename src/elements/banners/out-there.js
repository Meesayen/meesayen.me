import { fetchPreloadedCss, registerElement } from '../../utils.js'
import Vanilla from '../../vanilla/vanilla.js'

import { SmallStar, MediumStar, BigStar, HugeStar } from './stars.js'

function rand(n) {
  return Math.floor(Math.random() * n)
}

export default class OutThere extends Vanilla(HTMLElement) {
  static get observedAttributes() {
    return [
      'state'
    ]
  }

  get style() {
    return fetchPreloadedCss('/elements/banners/out-there.css')
  }

  get template() {
    return /* @vue */`
      <style unresolved>
        :host {
          position: absolute;
          width: 100vw;
          height: 75vh;
          background: black;

        }
        :host * { @apply --cloaked; }
      </style>

      <div class="wrap">
        <canvas id="stars" @mousemove="handleMouseMove"></canvas>

        <div class="credit">
          <em>Out There</em>
          <small>by Meesayen</small>
        </div>
      </div>
    `
  }

  constructor() {
    super()
    this.state = 'on'
    this.stars = []
    this.ctx = null
  }

  ready() {
    this.ctx = this.$.stars.getContext('2d')
    const { clientWidth: w, clientHeight: h } = this.$.stars
    this.$.stars.width = w * 2
    this.$.stars.height = h * 2
    this.createStarrySky(w * 2, h * 2)
    this.startRender(this.ctx)
  }

  startRender(ctx) {
    this.continueRendering = true
    let wait = false
    const goRender = () => requestAnimationFrame(() => {
      if (!wait) {
        this.renderStarrySky(ctx)
        wait = true
        setTimeout(() => {
          wait = false
        }, 100)
      }
      if (this.continueRendering) goRender()
    })
    goRender()
  }

  stopRender() {
    this.continueRendering = false
  }

  createStarrySky(w, h) {
    // eslint-disable-next-line no-unused-vars
    for (const i of [...Array((w - h) * 2)]) {
      const sizePick = Math.random() * 1000
      const x = rand(w)
      const y = rand(h)

      if (sizePick > 995) {
        this.stars.push(new HugeStar(x, y))
      } else if (sizePick > 955) {
        this.stars.push(new BigStar(x, y))
      } else if (sizePick > 800) {
        this.stars.push(new MediumStar(x, y))
      } else {
        this.stars.push(new SmallStar(x, y))
      }
    }
  }

  renderStarrySky(ctx) {
    for (const star of this.stars) {
      star.render(ctx)
    }
  }

  handleMouseMove(e) {
    console.log(e)
  }

  stateChanged(old, nue) {
    if (nue === 'off') {
      this.state = 'off'
      this.stopRender()
    } else {
      this.state = 'on'
      if (!this.ctx) return
      this.startRender(this.ctx)
    }
  }
}

registerElement(OutThere)
