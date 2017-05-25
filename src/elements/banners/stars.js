/* @flow */

export type Point = {|
  x: number,
  y: number,
|}

export interface Star {
  x: number,
  y: number,
  z: ?number,
  primaryColor: string,

  doTheMath(): void,
  move(center: Point): void,
  render(ctx: CanvasRenderingContext2D, shade?: number): void,
}

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

// const RAD = 180 / Math.PI

export class SmallStar implements Star {
  x: number
  y: number
  z: ?number
  velocity: number = 2
  primaryColor: string = 'ffffff'

  constructor(x: number, y: number, z?: number) {
    this.x = x
    this.y = y
    this.z = z
    this.doTheMath()
  }

  doTheMath() {}

  render(ctx: CanvasRenderingContext2D) {
    const shade = -Math.min(0.6, Math.random())
    ctx.beginPath()
    ctx.fillStyle = getColor(this.primaryColor, shade)
    ctx.rect(this.x, this.y, 1, 1)
    ctx.fill()
    ctx.closePath()
  }

  move(center: Point) {
    const rad = Math.atan2(center.x - this.x, center.y - this.y)
    // console.log('before', this.x, this.y, this.theta * RAD)
    this.x = this.x - (this.velocity * Math.sin(rad))
    this.y = this.y - (this.velocity * Math.cos(rad))
    // console.log('after', this.x, this.y)
    this.doTheMath()
  }
}

export class MediumStar extends SmallStar {
  secondaryColor = '656565'
  base: number[]
  left: number[]
  right: number[]
  up: number[]
  down: number[]

  doTheMath() {
    this.base = [this.x, this.y, 1, 1]

    this.left = [this.x - 1, this.y, 1, 1]
    this.right = [this.x + 1, this.y, 1, 1]
    this.up = [this.x, this.y - 1, 1, 1]
    this.down = [this.x, this.y + 1, 1, 1]
  }

  render(ctx: CanvasRenderingContext2D) {
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

export class BigStar extends MediumStar {
  velocity = 5

  doTheMath() {
    this.base = [this.x, this.y, 2, 2]

    this.left = [this.x - 2, this.y, 2, 2]
    this.right = [this.x + 2, this.y, 2, 2]
    this.up = [this.x, this.y - 2, 2, 2]
    this.down = [this.x, this.y + 2, 2, 2]
  }

  render(ctx: CanvasRenderingContext2D) {
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

export class HugeStar extends MediumStar {
  secondaryColor = '888888'
  tertiaryColor = '555555'
  leftTail: number[]
  rightTail: number[]
  upTail: number[]
  downTail: number[]
  velocity = 10

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

  renderTail(ctx: CanvasRenderingContext2D, shade?: number) {
    ctx.beginPath()
    ctx.fillStyle = getColor(this.tertiaryColor, shade)
    ctx.rect(...this.leftTail)
    ctx.rect(...this.rightTail)
    ctx.rect(...this.upTail)
    ctx.rect(...this.downTail)
    ctx.fill()
    ctx.closePath()
  }

  render(ctx: CanvasRenderingContext2D) {
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
