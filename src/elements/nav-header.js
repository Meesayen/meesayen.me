import { registerElement } from '../utils.js'
import styilist from '../stylist-mixin.js'

export default class NavHeader extends styilist(HTMLElement) {
  constructor() {
    super()
    this.handleHashChange = this.handleHashChange.bind(this)
  }

  get style() {
    return fetch('elements/nav-header.css').then(r => r.text())
  }

  get template() {
    return /* @html */`
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
  }

  get tabs() {
    return Array.from(this.root.querySelectorAll(`nav li`))
  }

  static get observedAttributes() {
    return [
      'ciao'
    ]
  }

  connectedCallback() {
    const { hash } = location
    this.selectTab(hash)
    window.addEventListener('hashchange', this.handleHashChange)
  }

  attributeChangedCallback(name, old, nue) {
    console.log(name, old, nue)
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
