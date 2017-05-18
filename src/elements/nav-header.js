import { fetchPreloadedCss, registerElement } from '../utils.js'
import Vanilla from '../vanilla/vanilla.js'

export default class NavHeader extends Vanilla(HTMLElement) {
  static style = fetchPreloadedCss('/elements/nav-header.css')

  static template = /* @vue */`
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
          <li :class="{ 'selected': isSelectedTab(selectedTab, 'home') }">
            <a href="#home">home</a>
          </li>
          <li :class="{ 'selected': isSelectedTab(selectedTab, 'works') }">
            <a href="#works">works</a>
          </li>
          <li :class="{ 'selected': isSelectedTab(selectedTab, 'blog') }">
            <a href="#blog">blog</a>
          </li>
          <li :class="{ 'selected': isSelectedTab(selectedTab, 'about') }">
            <a href="#about">about</a>
          </li>
        </ul>
      </nav>
    </div>
  `

  constructor() {
    super()
    this.selectedTab = 'home'
    this.handleHashChange = this.handleHashChange.bind(this)
  }

  isSelectedTab(a, b) {
    return a === b
  }

  connectedCallback() {
    super.connectedCallback()
    const [, hash] = location.href.split('#')
    this.selectTab(hash)
    window.addEventListener('hashchange', this.handleHashChange)
  }

  disconnectedCallback() {
    super.connectedCallback()
    window.removeEventListener('hashchange', this.handleHashChange)
  }

  handleHashChange(e) {
    const [, hash] = e.newURL.split('#')
    this.selectTab(hash)
  }

  selectTab(hash = 'home') {
    this.selectedTab = hash.startsWith('#') ? hash.slice(1) : hash
  }
}

registerElement(NavHeader)
