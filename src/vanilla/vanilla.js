import { mix } from '../utils.js'
import Marshall from './marshall-mixin.js'
import Spy from './spy-mixin.js'
import Stylist from './stylist-mixin.js'
import Binder from './binder-mixin.js'

export default superclass => class extends mix(superclass).with(
  // Order is important
  Binder,
  Stylist,
  Spy,
  Marshall
) {

}
