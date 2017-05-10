import { attachShadow, registerElement } from '../utils.js'
import './hero-banner.js'
import './nav-header.js'

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

      <nav-header></nav-header>

      <hero-banner title="Work in progress..."></hero-banner>
    `)
  }
}

registerElement(AppShell)
