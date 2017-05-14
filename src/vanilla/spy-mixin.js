import { camelCasify } from '../utils.js'

export default superclass => class extends superclass {
  // constructor(...args) {
  //   super(...args)
  // }
  //

  // Because I liked the way Polymer 1.x handled this
  // There's probably a super good reason why they moved away from this approach with the 2.0,
  // but I still prefer this very much.
  attributeChangedCallback(name, old, nue) {
    // Check is shallow by design - immutability is a must
    if (old === nue) return

    const methodName = `${camelCasify(name)}Changed`
    if (typeof this[methodName] === 'function') {
      this[methodName](old, nue)
    }
  }
 }
