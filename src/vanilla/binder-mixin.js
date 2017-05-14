import { genUID } from '../utils.js'

// NOTE: Lot of things thrown at a wall. I will have to clean this mess up and make it performant.
// Very much borrowed from VueJS templating syntax, which I love. ❤️

const interpolationRE = /(\{\{\s*[a-zA-Z_][a-zA-Z_\d]*\s*\}\})/
const analyzeInterpolations = root => {
  const mappings = Array.from(root.querySelectorAll('*'))
    .map(el => {
      const ins = Array.from(el.childNodes)
        .map((c, idx) => ({ idx, type: c.nodeName, val: c.nodeValue }))
        .filter(m => m.type === '#text')
        .filter(m => interpolationRE.test(m.val))
        .map(m => m.val.split(interpolationRE).reduce((acc, next) => {
          if (next.startsWith('{{')) {
            const propKey = next.replace(/\{|\}/g, '').trim()
            acc.props.add(propKey)
            acc.tpl += `\${this['${propKey}']}`
          } else {
            acc.tpl += next
          }
          return acc
        }, { idx: m.idx, props: new Set(), tpl: '' }))

      if (ins.length === 0) return null

      const id = el.dataset.vanilla || genUID()
      el.dataset.vanilla = id
      return {
        id,
        el,
        ins
      }
    })
    .filter(m => m !== null)
  return mappings
}

const analyzeAttributes = root => {
  const mappings = Array.from(root.querySelectorAll('*'))
    .map(el => {
      const attrs = Array.from(el.attributes).reduce((acc, next) => {
        if (next.nodeName.startsWith(':') || next.nodeName.startsWith('@')) {
          el.removeAttribute(next.nodeName)
          acc[next.nodeName] = next.nodeValue
        }
        return acc
      }, {})

      if (Object.keys(attrs).length === 0) return null

      const id = el.dataset.vanilla || genUID()
      el.dataset.vanilla = id
      return {
        id,
        el,
        attrs
      }
    })
    .filter(m => m !== null)
  return mappings
}

// Stupid simple regex to match literal values (not 100% accurate, but will do for now)
const literalRE = /^(?:\d+(?:\.\d+)?|true|false|undefuned|null|(['"]).*?\1)$/
const functionRE = /(\w+)\((.*?)\)/

const addListenerSymbol = Symbol('BinderMixin.addListener')
const addBindingSymbol = Symbol('BinderMixin.addBinding')
const addInterpolationSymbol = Symbol('BinderMixin.addInterpolation')
const bindingListSymbol = Symbol('BinderMixin.bindingsList')
const observations = Symbol('BinderMixin.observations')
const observationInstaller = Symbol('BinderMixin.observationInstaller')
const changeHandler = Symbol('BinderMixin.changeHandler')
const toggleClass = Symbol('BinderMixin.toggleClass')
const getElement = Symbol('BinderMixin.getElement')
const elementsCache = Symbol('BinderMixin.elementsCache')

// TODO: Add check to guarantee that an overridden lifecycle method calls the super.<method-name>()
export default superclass => class BinderMixin extends superclass {
  constructor(...args) {
    super(...args)
    this[bindingListSymbol] = []
    this[observations] = {}
    this[elementsCache] = new Map()
  }

  [getElement](id) {
    if (!this[elementsCache].has(id)) {
      this[elementsCache].set(id, this.root.querySelector(`[data-vanilla="${id}"]`))
    }
    return this[elementsCache].get(id)
  }

  [changeHandler](key, oldValue, newValue) {
    this[observations][key].forEach(handler => handler(oldValue, newValue))
  }

  [toggleClass](id, cls, bool = true) {
    // No empty strings (or other falsy values) allowed
    if (!cls) return
    this[getElement](id).classList.toggle(cls.replace(/['"`]/g, ''), bool)
  }

  [addListenerSymbol](id, el, attrName, attrValue) {
    let listener
    // FIXME: Very sloppy check - should use a regex and check if there's at least 1 param
    if (attrValue.endsWith(')')) {
      // event listener with custom inputs. i.e. "clickMe(a, b, c)"
      const parts = attrValue.slice(0, -1).split('(')
      const params = parts.pop().split(/,\s?/)
      const handler = parts.shift()
      listener = () => {
        this[handler](...params.map(p => this[p]))
      }
    } else {
      listener = e => {
        this[attrValue](e)
      }
    }

    el.addEventListener(attrName.slice(1), listener)
    this[bindingListSymbol].push({
      id,
      listener,
      event: attrName.slice(1)
    })
  }

  [observationInstaller](prop) {
    if (this[prop] === undefined) {
      console.error(`Error: Trying to bind a property '${prop}' that's not defined.`)
      return null
    }

    if (this[observations][prop] === undefined) {
      this[observations][prop] = []
      const shadowProp = Symbol(`BinderMixin.${prop}`)
      const desc = Object.getOwnPropertyDescriptor(this, prop)
      let isPlainValue
      if (desc === undefined || {}.hasOwnProperty.call(desc, 'value')) {
        isPlainValue = true
        this[shadowProp] = { value: desc === undefined ? this[prop] : desc.value }
      } else {
        isPlainValue = false
        this[shadowProp] = { get: desc.get.bind(this), set: desc.set.bind(this) }
      }

      Object.defineProperty(this, prop, {
        get() {
          return isPlainValue ? this[shadowProp].value : this[shadowProp].get()
        },
        set(newValue) {
          let oldValue
          // Check is shallow by design - immutability is a must
          if (isPlainValue) {
            oldValue = this[shadowProp].value
            if (oldValue === newValue) return
            this[shadowProp].value = newValue
          } else {
            oldValue = this[shadowProp].get()
            if (oldValue === newValue) return
            this[shadowProp].set(newValue)
          }
          this[changeHandler](prop, oldValue, newValue)
        },
        enumerable: true,
        configurable: true
      })
    }
  }

  [addBindingSymbol](id, el, attrName, attrValue) {
    // NOTE: class bindings have different treatments
    if (attrName === ':class') {
      // Sloppy check for { 'cls': eval } notation
      if (attrValue.startsWith('{')) {
        const trimmed = attrValue.replace(/\s+|[{}]/g, '')
        const pairs = trimmed.split('|').map(pair => pair.split(':'))

        pairs.forEach(([cls, condition]) => {
          switch (true) {
          case literalRE.test(condition):
            // console.log('literal:', cls, condition)
            // If it's a literal value, just eval it now and be done with it
            this[toggleClass](id, cls, Boolean(condition))
            break
          case /===?/.test(condition):
            // console.log('equality check:', cls, condition)
            // If contains double/triple equals assume it is a strict equality check always
            // TODO: This is the most complex, coming back to it later
            console.warn(`This syntax \`{ ${cls}: ${condition} }\` is not supported yet.`)
            break
          case functionRE.test(condition): {
            const [, methodName, paramsString] = condition.match(functionRE)
            const params = paramsString.split(',').map(p => {
              if (literalRE.test(p)) return { isLiteral: true, value: p.replace(/['"]/g, '') }

              return { isLiteral: false, value: p }
            })
            // console.log('function call:', cls, methodName, params)
            // TODO: Should I put a check to avoid infinite loops? (if the method being called would
            // mutate the property that is being watched to trigger the very same method)
            // TODO: Check if methodName exists on instance
            const changeHandler = () => {
              const bool = this[methodName](...params.map(p => p.isLiteral ?
                  p.value :
                  this[p.value])
              )
              this[toggleClass](id, cls, bool)
            }

            changeHandler()

            // NOTE: changes are only triggered on defined function parameters
            // If an unknown property is used inside the listed method, and it changes, it won't
            // retrigger the change handler.
            // Therefore functions used in a :class context should always be pure functions
            params.forEach(param => {
              if (param.isLiteral === true) return
              this[observationInstaller](param.value)
              this[observations][param.value].push(changeHandler)
            })
            break
          }
          // I really don't like this part, but if you add a `this.title` to a custom element
          // instance, for example, they won't have `title` has an owned property, because it is a
          // property of its parent HTMLElement. Therefore I must use the `in` operator for now.
          case condition in this: {
            // console.log('property binding:', cls, condition)
            const changeHandler = (old, nue) => {
              this[toggleClass](id, cls, Boolean(nue))
            }

            changeHandler(null, this[condition])

            this[observationInstaller](condition)
            this[observations][condition].push(changeHandler)
            break
          }
          default:
            console.warn(`Oops. Either this property \`${condition}\` does not exist or`)
            console.warn(`this syntax \`{ ${cls}: ${condition} }\` is not supported yet.`)
          }
        })
      } else {
        // Simple :class="property" case - no other fancy syntax would be supported at first
        this[toggleClass](id, this[attrValue])

        this[observationInstaller](attrValue)

        this[observations][attrValue].push((old, nue) => {
          this[toggleClass](id, old, false)
          this[toggleClass](id, nue, true)
        })
      }
      return
    }

    // TODO: Check if element exists. If not, something mutated the dom and the binding is broken
    el.setAttribute(attrName.slice(1), this[attrValue])

    this[observationInstaller](attrValue)

    this[observations][attrValue].push((old, nue) => {
      this[getElement](id).setAttribute(attrName.slice(1), nue)
    })
  }

  [addInterpolationSymbol](id, el, i, props, tpl) {
    // eslint-disable-next-line no-new-func
    const interpolator = Function(`return \`${tpl}\``).bind(this)

    el.childNodes[i].textContent = interpolator()

    props.forEach(prop => {
      this[observationInstaller](prop)

      this[observations][prop].push(() => {
        this[getElement](id).childNodes[i].textContent = interpolator()
      })
    })
  }

  connectedCallback() {
    const interpolMappings = analyzeInterpolations(this.root)
    interpolMappings.forEach(({ id, el, ins }) => {
      ins.forEach(({ idx, props, tpl }) => {
        this[addInterpolationSymbol](id, el, idx, Array.from(props), tpl)
      })
    })

    const attrMappings = analyzeAttributes(this.root)
    attrMappings.forEach(({ attrs, id, el }) => {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k.startsWith('@')) this[addListenerSymbol](id, el, k, v)
        else if (k.startsWith(':')) this[addBindingSymbol](id, el, k, v)
      })
    })
  }

  disconnectedCallback() {
    console.log('%cBurn everything! 🔥', 'color: red')
    this[bindingListSymbol].forEach(binding => {
      this[getElement](binding.id).removeEventListener(binding.event, binding.listener)
    })
  }
}
