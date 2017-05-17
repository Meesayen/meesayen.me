function getColor(hex, lum = 0) {
  // convert to decimal and change luminosity
  let rgb = '#'
  let c
  for (let i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16)
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
    rgb += `00${c}`.substr(c.length)
  }

  return rgb
}

class Star {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
    this.doTheMath()
  }

  // Override me
  doTheMath() {}

  // Override me
  render() {}
}

export class SmallStar extends Star {
  constructor(...args) {
    super(...args)
    this.primaryColor = 'ffffff'
  }

  doTheMath() {

  }

  render(ctx) {
    const shade = -Math.min(0.6, Math.random())
    ctx.beginPath()
    ctx.fillStyle = getColor(this.primaryColor, shade)
    ctx.rect(this.x, this.y, 1, 1)
    ctx.fill()
    ctx.closePath()
  }
}

export class MediumStar extends Star {
  constructor(...args) {
    super(...args)
    this.primaryColor = 'ffffff'
    this.secondaryColor = '656565'
  }

  doTheMath() {
    this.base = [this.x, this.y, 1, 1]

    this.left = [this.x - 1, this.y, 1, 1]
    this.right = [this.x + 1, this.y, 1, 1]
    this.up = [this.x, this.y - 1, 1, 1]
    this.down = [this.x, this.y + 1, 1, 1]
  }

  render(ctx) {
    const shade = -Math.min(0.2, Math.random())
    ctx.beginPath()
    ctx.fillStyle = getColor(this.primaryColor, shade)
    ctx.rect(...this.base)
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = getColor(this.secondaryColor, shade)
    ctx.rect(...this.left)
    ctx.rect(...this.right)
    ctx.rect(...this.up)
    ctx.rect(...this.down)
    ctx.fill()
    ctx.closePath()
  }
}

export class BigStar extends Star {
  constructor(...args) {
    super(...args)
    this.primaryColor = 'ffffff'
    this.secondaryColor = '656565'
  }

  doTheMath() {
    this.base = [this.x, this.y, 2, 2]

    this.left = [this.x - 2, this.y, 2, 2]
    this.right = [this.x + 2, this.y, 2, 2]
    this.up = [this.x, this.y - 2, 2, 2]
    this.down = [this.x, this.y + 2, 2, 2]
  }

  render(ctx) {
    const shade = -Math.min(0.3, Math.random())
    ctx.beginPath()
    ctx.fillStyle = getColor(this.primaryColor, shade)
    ctx.rect(...this.base)
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = getColor(this.secondaryColor, shade)
    ctx.rect(...this.left)
    ctx.rect(...this.right)
    ctx.rect(...this.up)
    ctx.rect(...this.down)
    ctx.fill()
    ctx.closePath()
  }
}

export class HugeStar extends Star {
  constructor(...args) {
    super(...args)
    this.primaryColor = 'ffffff'
    this.secondaryColor = '888888'
    this.tertiaryColor = '555555'
  }

  doTheMath() {
    this.base = [this.x, this.y, 5, 5]

    this.left = [this.x - 2, this.y + 1, 2, 3]
    this.right = [this.x + 5, this.y + 1, 2, 3]
    this.up = [this.x + 1, this.y - 2, 3, 2]
    this.down = [this.x + 1, this.y + 5, 3, 2]

    this.leftTail = [this.x - 5, this.y + 2, 3, 1]
    this.rightTail = [this.x + 7, this.y + 2, 3, 1]
    this.upTail = [this.x + 2, this.y - 5, 1, 3]
    this.downTail = [this.x + 2, this.y + 7, 1, 3]
  }

  renderTail(ctx, shade) {
    ctx.beginPath()
    ctx.fillStyle = getColor(this.tertiaryColor, shade)
    ctx.rect(...this.leftTail)
    ctx.rect(...this.rightTail)
    ctx.rect(...this.upTail)
    ctx.rect(...this.downTail)
    ctx.fill()
    ctx.closePath()
  }

  render(ctx) {
    const shade = -Math.min(0.3, Math.random())
    ctx.beginPath()
    ctx.fillStyle = getColor(this.primaryColor, shade)
    ctx.rect(...this.base)
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = getColor(this.secondaryColor, shade)
    ctx.rect(...this.left)
    ctx.rect(...this.right)
    ctx.rect(...this.up)
    ctx.rect(...this.down)
    ctx.fill()
    ctx.closePath()

    this.renderTail(ctx)
  }
}
