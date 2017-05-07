export const attachShadow = (ctx, str) => {
  const shadow = ctx.attachShadow({ mode: 'open' })
  shadow.innerHTML = str
  return shadow
}
