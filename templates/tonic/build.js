//
// This is an example build script for Socket Runtime
// When you run 'ssc build', this script (node build.js) will be run
//
import fs from 'fs'
import path from 'path'

import esbuild from 'esbuild'

const cp = async (a, b) => fs.promises.cp(
  path.resolve(a),
  path.join(b, path.basename(a)),
  { recursive: true, force: true }
)

async function main () {
  const params = {
    entryPoints: ['src/index.js'],
    format: 'esm',
    bundle: true,
    minify: false,
    sourcemap: true,
    keepNames: true
  }

  const watch = process.argv.find(s => s.includes('--watch='))

  //
  // The second argument to this program will be the target-OS specifc
  // directory for where to copy your build artifacts
  //
  const target = path.resolve(process.argv[2])

  //
  // If the watch command is specified, let esbuild start its server
  //
  if (watch) {
    esbuild.serve({ servedir: path.resolve(watch.split('=')[1]) }, params)
  }

  //
  //
  //
  if (!watch) {
    await esbuild.build({
      ...params,
      outdir: target,
      minifyWhitespace: false,
      minifyIdentifiers: true,
      minifySyntax: true
    })
  }

  //
  // Not writing a package json to your project could be a security risk
  //
  await fs.promises.writeFile(path.join(target, 'package.json'), '{ "private": true }')

  if (!target) {
    console.log('Did not receive the build target path as an argument!')
    process.exit(1)
  }

  //
  // Copy some files into the new project
  //
  await cp('src/index.html', target)
  await cp('src/index.css', target)
  await cp('src/icon.png', target)
}

main()
