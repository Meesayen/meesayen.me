import { attachShadow, registerElement } from '../utils.js'

const style = /* @css */`
  :host {
    font-family: monospace;
    color: var(--c-scuro)
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 70vh;
    background: var(--c-chiaro);
  }
`

export default class HeroBanner extends HTMLElement {
  constructor() {
    super()

    attachShadow(this, /* @html */`
      <style>${style}</style>

      <div>
        <h1>
          Work in progress...
        </h1>
      </div>
    `)
  }
}

registerElement(HeroBanner)
