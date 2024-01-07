//
// This is an example build script for Socket Runtime
// When you run 'ssc build', this script (node build.js) will be run
//
import path from 'node:path'
import fs from 'node:fs'
import { build } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

async function main () {
  const prod = process.argv.find(s => s.includes('--prod'))

  const watch = process.argv.find(s => s.includes('--watch='))

  //
  // The second argument to this program will be the target-OS specifc
  // directory for where to copy your build artifacts
  //
  const target = path.resolve(process.env.PREFIX)

  //
  // If the watch command is specified, let esbuild start its server
  //
  // TODO: Implement watch mode

  //
  //
  //
  if (!watch) {
    await build({
      root: path.resolve('./src'),
      mode: prod ? 'production' : 'development',
      base: './',
      plugins: [svelte()],
      build: {
        outDir: target,
        emptyOutDir: false,
        sourcemap: !prod,
        minify: prod ? 'esbuild' : false,
        rollupOptions: {
          external: [/socket:.*/]
        }
        // modulePreload: {
        //   polyfill: false
        // },
      }
    })
  }
  // TODO: Implement test mode
  // if (process.argv.find(s => s.includes('--test'))) {
  //   ...
  // }

  //
  // Not writing a package json to your project could be a security risk
  //
  await fs.promises.writeFile(path.join(target, 'package.json'), '{ "type": "module", private": true }')

  if (!target) {
    console.log('Did not receive the build target path as an argument!')
    process.exit(1)
  }
}

main()
