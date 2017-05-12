#!/usr/bin/env node

const execa = require('execa')
const fs = require('async-file')
const globby = require('globby')
const del = require('del')

async function main() {
  const cssFiles = await globby('./src/**/*.css')

  await del('./dist')

  const res = await execa('babili', ['./src', '--out-dir', './dist'], { cwd: process.cwd() })
  console.log(res.stdout)

  await Promise.all(cssFiles.map(async f => {
    return fs.writeFile(
      f.replace('./src', './dist'),
      await fs.readFile(f, 'utf-8'),
      'utf-8'
    )
  }))
  console.log('\nCSS files moved to ./dist/')
}

main().catch(err => console.log(err))
