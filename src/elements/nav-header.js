import { attachShadow, registerElement } from '../utils.js'

const style = /* @css */`
  :host {
    font-family: monospace;
    display: flex;
    flex-direction: row;
  }

  * {
    box-sizing: border-box;
  }

  .logo {
    padding: 15px;
    font-size: 2rem;
    color: var(--c-scuro);
  }

  nav {
    width: 100%;
    padding: 15px;
  }

  ul,
  li {
    @apply --reset-list;
  }

  ul {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  li {
    display: inline-block;
    padding: 10px;
    color: var(--c-scuro);
    text-transform: capitalize;
    font-size: .9rem;
  }

  a {
    @apply --reset-link;
    position: relative;
  }

  li a::after {
    content: '';
    width: 100%;
    height: 2px;
    position: absolute;
    bottom: -4px;
    left: 0;
    background: var(--c-accent);
    transform: rotateY(90deg);
    transform-origin: left;
    will-change: transform;
    transition: transform 150ms ease-in-out;
  }

  li.selected a::after {
    transform: rotateY(0);
  }

`

const template = /* @html */`
  <style>${style}</style>

  <div class="logo">
    <a href="#home">Meesayen's</a>
  </div>

  <nav>
    <ul>
      <li>
        <a href="#home">home</a>
      </li>
      <li>
        <a href="#works">works</a>
      </li>
      <li>
        <a href="#blog">blog</a>
      </li>
      <li>
        <a href="#about">about</a>
      </li>
    </ul>
  </nav>
`

export default class NavHeader extends HTMLElement {
  constructor() {
    super()

    attachShadow(this, template)
    this.handleHashChange = this.handleHashChange.bind(this)
  }

  connectedCallback() {
    const { hash } = location
    this.selectTab(hash)
    window.addEventListener('hashchange', this.handleHashChange)
  }

  get tabs() {
    const { shadowRoot: root } = this
    return Array.from(root.querySelectorAll(`nav li`))
  }

  handleHashChange(e) {
    const hash = e.newURL.split('#').pop()
    this.selectTab(`#${hash}`)
  }

  selectTab(hash) {
    this.tabs
      .filter(t => t.classList.contains('selected'))
      .forEach(t => t.classList.remove('selected'))
    this.tabs.find(t => t.querySelector('a').hash === (hash || '#home')).classList.add('selected')
  }
}

registerElement(NavHeader)
