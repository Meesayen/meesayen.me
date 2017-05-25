/* @flow */

import { fetchPreloadedCss, registerElement } from '../../utils.js'
import Vanilla from '../../vanilla/vanilla.js'

import { SmallStar, MediumStar, BigStar, HugeStar } from './stars.js'
import type { Point } from './stars.js'

function rand(n: number) {
  return Math.floor(Math.random() * n)
}

export default class OutThere extends Vanilla(HTMLElement) {
  static get observedAttributes() {
    return [
      'state'
    ]
  }

  static style = fetchPreloadedCss('/elements/banners/out-there.css')

  static template = /* @vue */`
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

  state: string
  stars: SmallStar[]
  center: Point
  ctx: CanvasRenderingContext2D

  constructor() {
    super()
    this.state = 'on'
    this.stars = []
  }

  ready() {
    this.ctx = this.$.stars.getContext('2d')
    const { clientWidth: w, clientHeight: h } = this.$.stars
    this.$.stars.width = w * 2
    this.$.stars.height = h * 2
    this.center = {
      x: w,
      y: h
    }
    this.createStarrySky(w * 2, h * 2)
    this.startRender(this.ctx)
    this.startUpdate()
  }

  createStarrySky(w: number, h: number) {
    // eslint-disable-next-line no-unused-vars
    for (const i of [...Array((w - h) * 2)]) {
      // for (const i of [...Array(1)]) {
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

  renderStarrySky(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.$.stars.width, this.$.stars.height)
    for (const star of this.stars) {
      star.render(ctx)
    }
  }

  startRender(ctx: CanvasRenderingContext2D) {
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

  startUpdate() {
    this.continueUpdating = true
    let wait = false
    const update = () => requestAnimationFrame(() => {
      if (!wait) {
        for (const star of this.stars) {
          star.move(this.center)
        }
        wait = true
        setTimeout(() => {
          wait = false
        }, 100)
      }
      if (this.continueUpdating) update()
    })
    update()
  }

  stopUpdate() {
    this.continueUpdating = false
  }

  handleMouseMove(e: MouseEvent) {
    console.log(e)
  }

  stateChanged(old: string, nue: string) {
    if (nue === 'off') {
      this.state = 'off'
      this.stopRender()
      this.stopUpdate()
    } else {
      this.state = 'on'
      if (!this.ctx) return
      this.startRender(this.ctx)
      this.startUpdate()
    }
  }
}

registerElement(OutThere)
