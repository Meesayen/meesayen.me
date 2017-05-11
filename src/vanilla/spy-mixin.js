import { camelcasify } from '../utils.js'

export default superclass => class extends superclass {
  // constructor(...args) {
  //   super(...args)
  // }
  //
  attributeChangedCallback(name, old, nue) {
    if (old === nue) return
    const methodName = `${camelcasify(name)}Changed`
    if (this[methodName]) {
      this[methodName](old, nue)
    }
  }
 }
