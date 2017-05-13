import { fetchPreloadedCss, registerElement } from '../utils.js'
import Styilist from '../vanilla/stylist-mixin.js'

export default class NavHeader extends Styilist(HTMLElement) {
  constructor() {
    super()

    this.handleHashChange = this.handleHashChange.bind(this)
  }

  get style() {
    return fetchPreloadedCss('/elements/nav-header.css')
  }

  get template() {
    return /* @vue */`
      <!--
        NOTE: pre-style your component before the .css is fetched and injected with an [unresolved]
        <style> tag. Useful to avoid FOUC situations.
      -->
      <style unresolved>
        :host {
          display: block;
          height: 67px;
          box-sizing: border-box;
          background: var(--c-primary);
        }

        :host * { @apply --cloaked; }
      </style>

      <div class="wrap">
        <div class="logo">
          <a href="#home">Meesayen's</a>
        </div>

        <!-- TODO: Create directives for common stuff like repeat and show/hide -->
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
      </div>
    `
  }

  get tabs() {
    return Array.from(this.root.querySelectorAll(`nav li`))
  }

  connectedCallback() {
    const { hash } = location
    this.selectTab(hash)
    window.addEventListener('hashchange', this.handleHashChange)
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
