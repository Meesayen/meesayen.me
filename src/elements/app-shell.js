import Stylist from '../vanilla/stylist-mixin.js'
import { registerElement, mix } from '../utils.js'
import './hero-banner.js'
import './nav-header.js'

export default class AppShell extends mix(HTMLElement).with([Stylist]) {
  get style() {
    return fetch('elements/app-shell.css').then(r => r.text())
  }

  get template() {
    return /* @html */`
      <nav-header></nav-header>

      <hero-banner title="Work in progress..."></hero-banner>

      <footer></footer>
    `
  }
}

registerElement(AppShell)
