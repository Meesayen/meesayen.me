import { genUID } from '../utils.js'

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

      // FIXME: Reuse existing id if found
      const id = `vanilla-${genUID()}`
      el.setAttribute(id, '')
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

      const id = `vanilla-${genUID()}`
      el.setAttribute(id, '')
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

export default superclass => class extends superclass {
  constructor(...args) {
    super(...args)
    this[bindingListSymbol] = []
  }

  [addListenerSymbol](id, el, attrName, attrValue) {
    let listener
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

  [addBindingSymbol](id, el, attrName, attrValue) {
    if (this[attrValue] === undefined) {
      console.error(`Error: Trying to bind a property '${attrValue}' that's not defined.`)
      return null
    }

    // getOwnPropertyDescriptor get/set | value (to keep possible getters/setters)
    const shadowProp = Symbol(attrValue)
    this[shadowProp] = this[attrValue]
    this.root.querySelector(`[${id}]`).setAttribute(attrName.slice(1), this[attrValue])
    Object.defineProperty(this, attrValue, {
      get() {
        return this[shadowProp]
      },
      set(newValue) {
        this[shadowProp] = newValue
        this.root.querySelector(`[${id}]`).setAttribute(attrName.slice(1), newValue)
      },
      enumerable: true,
      configurable: true
    })
  }

  // FIXME: aggregate equal props mutations listeners
  [addInterpolationSymbol](id, el, idx, props, tpl) {
    const interpolatorSymbol = Symbol(tpl)
    // eslint-disable-next-line no-new-func
    this[interpolatorSymbol] = Function(`return \`${tpl}\``)

    el.childNodes[idx].textContent = this[interpolatorSymbol]()

    props.forEach(p => {
      if (this[p] === undefined) {
        console.error(`Error: Trying to bind a property '${p}' that's not defined.`)
        return null
      }

      const shadowProp = Symbol(`${p}${idx}`)
      const desc = Object.getOwnPropertyDescriptor(this, p)
      if (desc === undefined || desc.value) {
        this[shadowProp] = { value: desc === undefined ? this[p] : desc.value }
      } else {
        this[shadowProp] = { get: desc.get.bind(this), set: desc.set.bind(this) }
      }

      Object.defineProperty(this, p, {
        get() {
          return this[shadowProp].value || this[shadowProp].get()
        },
        set(newValue) {
          if (this[shadowProp].value) {
            this[shadowProp].value = newValue
          } else {
            this[shadowProp].set(newValue)
          }
          this.root.querySelector(`[${id}]`).childNodes[idx].textContent = this[interpolatorSymbol]()
        },
        enumerable: true,
        configurable: true
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
      this.root.querySelector(`[${binding.id}]`).removeEventListener(binding.event, binding.listener)
    })
  }
}
