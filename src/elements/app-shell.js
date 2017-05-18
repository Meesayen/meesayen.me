import { fetchPreloadedCss, registerElement } from '../utils.js'
import Stylist from '../vanilla/stylist-mixin.js'

// Not liking this part very much. Feels so magical.
import './hero-banner.js'
import './nav-header.js'

export default class AppShell extends Stylist(HTMLElement) {
  static style = fetchPreloadedCss('/elements/app-shell.css')

  static template = /* @vue */`
    <nav-header></nav-header>

    <hero-banner message="Work in progress..."></hero-banner>

    <footer></footer>
  `
}

registerElement(AppShell)
