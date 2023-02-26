//
// This is an example build script for Socket Runtime
// When you run 'ssc build', this script (node build.js) will be run
//
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { build } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const dirname = path.dirname(import.meta.url).replace(`file://${os.platform() === 'win32' ? '/' : ''}`, '')

function socket_import()
{
  return {
    name: 'socket-runtime-virtual-modules',  
    transform(module, id) {
      let pos = -1;
      const SOCKET_PREFIX_LEN = 7;
      do {
        pos = module.search(/socket:.*/)
        if (pos > -1) {
          let sub = module.substring(pos+SOCKET_PREFIX_LEN);
          let end_pos = sub.search(/'|\n/);
          let end_char = sub[end_pos];
          if (end_pos == -1) {
            end_pos = sub.length;
            end_char = '';
          }

          const basename = sub.substring(0, end_pos);
          const filename =  `../node_modules/@socketsupply/socket/${basename}` + '.js' + end_char;
          var debug = module.replace(/socket:.*/, filename)
          module = module.replace(/socket:.*/, filename)
        }
      } while (pos > -1)

      return {
        code: module,
        map: null
      }
    },
  }
}

async function main () {
  const prod = process.argv.find(s => s.includes('--prod'))

  const watch = process.argv.find(s => s.includes('--watch='))

  //
  // The second argument to this program will be the target-OS specifc
  // directory for where to copy your build artifacts
  //
    const target = path.resolve(process.argv[2])

  //
  // If the watch command is specified, let esbuild start its server
  //
  // TODO: Implement watch mode

  //
  //
  //

  var external = [];
  var plugins = [];
  plugins.push(svelte())
  if (os.platform() !== 'win32') {
    external.push(/socket:.*/)
  } else {
    plugins.push(socket_import())
  } 

  if (!watch) {
    await build({
      root: path.resolve('./src'),
      mode: prod ? 'production' : 'development',
      base: './',
      plugins: plugins,
      build: {
        outDir: target,
        emptyOutDir: false,
        sourcemap: !prod,
        minify: !!prod ? 'esbuild' : false,
        rollupOptions: {
          external: external,
        },
        // modulePreload: {
        //   polyfill: false
        // },
      },
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
