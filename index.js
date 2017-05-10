const Koa = require('koa')
const fs = require('async-file')
const serve = require('koa-static')
const Router = require('koa-router')
const favicon = require('koa-favicon')

const app = new Koa()
const router = new Router()

const port = process.env.PORT || 3000

// TODO: add a build pipeline to support more browsers
// if (process.env.NODE_ENV === 'production') {
//   app.use(serve(`${__dirname}/dist`))
// } else {
app.use(serve(`${__dirname}/src`))
// }

app.use(favicon(`${__dirname}/favicon.ico`))

;(async () => {
  const index = await fs.readFile(`${__dirname}/index.html`, 'utf-8')

  router.get('/', ctx => {
    ctx.body = index
  })

  router.get('/test', ctx => {
    ctx.body = index
  })

  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(port, () => {
    console.log(`App ready at http://localhost:${port}`)
  })
})()
