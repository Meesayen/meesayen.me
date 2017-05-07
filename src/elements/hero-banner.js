import { attachShadow } from '../utils.js'

const style = /* @css */`
  :host {
    --color: rebeccapurple;
  }

  div {
    color: var(--color);
  }
`

export default class HeroBanner extends HTMLElement {
  constructor() {
    super()

    attachShadow(this, /* @html */`
      <style>${style}</style>

      <div>Hero Banner</div>
    `)
  }
}

customElements.define('hero-banner', HeroBanner)
