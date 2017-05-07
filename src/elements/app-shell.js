import { attachShadow } from '../utils.js'
import './hero-banner.js'

const style = /* @css */`
  :host {
    --color: red;
  }

  div {
    color: var(--color);
  }
`

export default class AppShell extends HTMLElement {
  constructor() {
    super()

    attachShadow(this, /* @html */`
      <style>${style}</style>

      <div>App Shell</div>

      <hero-banner></hero-banner>
    `)
  }
}

customElements.define('app-shell', AppShell)
