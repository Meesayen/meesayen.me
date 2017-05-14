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

const addListenerSymbol = Symbol('addListener')
const addBindingSymbol = Symbol('addBinding')
const addInterpolationSymbol = Symbol('addInterpolation')
const bindingListSymbol = Symbol('bindingsList')
const observations = Symbol('observations')
const observationInstaller = Symbol('observationInstaller')
const changeHandler = Symbol('changeHandler')

export default superclass => class extends superclass {
  constructor(...args) {
    super(...args)
    this[bindingListSymbol] = []
    this[observations] = {}
  }

  [changeHandler](key, value) {
    this[observations][key].forEach(handler => handler(value))
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
      const shadowProp = Symbol(`${prop}`)
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
          // Check is shallow by design - immutability is a must
          if (isPlainValue) {
            if (this[shadowProp].value === newValue) return
            this[shadowProp].value = newValue
          } else {
            if (this[shadowProp].get() === newValue) return
            this[shadowProp].set(newValue)
          }
          this[changeHandler](prop, newValue)
        },
        enumerable: true,
        configurable: true
      })
    }
  }

  [addBindingSymbol](id, el, attrName, attrValue) {
    // TODO: Check if element exists. If not, something mutated the dom and the binding is broken
    this.root.querySelector(`[data-vanilla="${id}"]`)
        .setAttribute(attrName.slice(1), this[attrValue])

    this[observationInstaller](attrValue)

    this[observations][attrValue].push(value => {
      this.root.querySelector(`[data-vanilla="${id}"]`).setAttribute(attrName.slice(1), value)
    })
  }

  [addInterpolationSymbol](id, el, i, props, tpl) {
    // eslint-disable-next-line no-new-func
    const interpolator = Function(`return \`${tpl}\``).bind(this)

    el.childNodes[i].textContent = interpolator()

    props.forEach(prop => {
      this[observationInstaller](prop)

      this[observations][prop].push(() => {
        this.root.querySelector(`[data-vanilla="${id}"]`).childNodes[i].textContent = interpolator()
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
    this[bindingListSymbol].forEach(binding => {
      this.root.querySelector(`[data-vanilla="${binding.id}"]`)
          .removeEventListener(binding.event, binding.listener)
    })
  }
}
