#!/usr/bin/env node

import fs from 'node:fs/promises'
import util from 'node:util'
import path from 'node:path'
import { exec as ecp } from 'node:child_process'

const exec = util.promisify(ecp)
const __dirname = new URL(path.dirname(import.meta.url)).pathname
const DEFAULT_TEMPLATE = 'vanilla'

const cp = async (a, b) => fs.cp(
  path.resolve(a),
  path.join(b, path.basename(a)),
  { recursive: true, force: true }
)

async function help (templateNames) {
  console.log(`usage: create-socket-app [${templateNames.join(' | ')}]`)
}

async function install () {
}

const DEFAULT_DEPS = [
  '@socketsupply/socket-api'
]

const DEFAULT_DEV_DEPS = [
  '@socketsupply/tapzero',
  '@socketsupply/test-dom'
]

const templates = {}

templates.vanilla = {
  devDeps: ['esbuild']
}
templates.tonic = {
  deps: ['@socketsupply/tonic'], 
  devDeps: ['esbuild']
}
templates.react = {
  deps: ['react', 'react-dom'],
  devDeps: ['esbuild']
}
templates.vue = {
  deps: ['vue'], 
  devDeps: ['vite','@vitejs/plugin-vue']
}
templates.svelte = {
  deps: ['svelte'],
  devDeps: ['vite','@sveltejs/vite-plugin-svelte']
}

async function main (argv) {
  const templateName = argv[0] ?? DEFAULT_TEMPLATE

  const templateNames = await fs.readdir(path.join(__dirname, 'templates'))

  if (argv.find(s => s.includes('-h'))) {
    return help(templateNames)
  }

  if (templateName && templateNames.findIndex(s => s === templateName) === -1) {
    console.error(`Unable to find template "${templateName}"`)
    return help(templateNames)
  }

  //
  // Check if the ssc command is installed, if not install it.
  //
  try {
    await exec('ssc')
  } catch (err) {
    if (err.code === 127) await install()
  }

  //
  // If the current directory is not empty, refuse to initialize it.
  // Empty excludes the following list of files from the directory.
  //
  const accepted = [
    '.DS_Store',
    '.git',
    '.gitattributes',
    '.gitignore',
    '.gitlab-ci.yml',
    '.hg',
    '.hgcheck',
    '.hgignore',
    '.idea',
    '.npmignore',
    '.travis.yml',
    'docs',
    'LICENSE',
    'README.md',
    'mkdocs.yml',
    'Thumbs.db'
  ]

  try {
    const entries = (await fs.readdir(process.cwd()))
      .filter(file => !accepted.includes(file))

    if (entries.length) {
      process.stdout.write('\nThe current directory is not empty\n')
      process.exit(1)
    }
  } catch (err) {
    process.stderr.write(`\nUnable to read the current directory: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }

  //
  // Initialize the current directory as a socket app.
  //
  try {
    process.stdout.write('\nCreating socket files...')
    await exec('ssc init')
  } catch (err) {
    process.stderr.write(`\nUnable to create socket files: ${err.stack ?? err.message}\n`)
  }
  process.stdout.write('OK')

  //
  // Create a package.json that has the module and a basic build setup.
  //
  try {
    process.stdout.write('\nInitializing npm package...')
    await exec('npm init -y')
  } catch (err) {
    process.stderr.write(`\nUnable to run npm init: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('OK')

  //
  // Install an opinionated base of modules for building a simple app.
  //
  const devDeps = [
    ...DEFAULT_DEV_DEPS,
    ...templates[templateName]?.devDeps ?? []
  ]
  if (devDeps.length > 0) {
    try {
      process.stdout.write('\nInstalling developer dependencies...')
      await exec(`npm install -D ${devDeps.join(' ')}`)
    } catch (err) {
      process.stderr.write(`\nUnable to run npm install: ${err.stack ?? err.message}\n`)
      process.exit(1)
    }
  }
  const deps = [
    ...DEFAULT_DEPS,
    ...templates[templateName]?.deps ?? []
  ]
  if (deps.length > 0) {
    try {
      process.stdout.write('\nInstalling dependencies...')
      await exec(`npm install ${deps.join(' ')}`)
    } catch (err) {
      process.stderr.write(`\nUnable to run npm install: ${err.stack ?? err.message}\n`)
      process.exit(1)
    }
  }
  process.stdout.write('OK')
  
  process.stdout.write('\nAdding package scripts...')
  let pkg

  try {
    pkg = JSON.parse(await fs.readFile('package.json'))
  } catch (err) {
    process.stderr.write(`\nUnable to read package.json: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }

  pkg.type = 'module'
  pkg.scripts.start = 'ssc build -r -o'
  pkg.scripts.build = 'ssc build'
  pkg.scripts.test = 'ssc build -r -o --test=./test/index.js --headless'

  try {
    fs.writeFile('package.json', JSON.stringify(pkg, 2, 2))
  } catch (err) {
    process.stderr.write(`\nUnable to write package.json: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }

  process.stdout.write('OK')

  let config
  process.stdout.write('\nUpdating project configuration...')

  try {
    config = await fs.readFile('socket.ini', 'utf8')
  } catch (err) {
    process.stderr.write(`\nUnable to read socket.ini: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }

  const oldCommand = '; build = "node build-script.js"'
  const newCommand = 'build = "node build.js"'
  const oldName = 'name = "beepboop"'
  const newName = `name = "${pkg.name}"`

  config = config
    .replace(oldCommand, newCommand)
    .replace(oldName, newName)

  try {
    await fs.writeFile('socket.ini', config)
  } catch (err) {
    process.stderr.write(`\nUnable to write socket.ini: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('OK')
  
  process.stdout.write('\nCopying project boilerplate...')

  const dirsToCopy = [
    'common',
    `templates/${templateName}`
  ]

  let filesToCopy
  try {
    const filesInGroups = await Promise.all(dirsToCopy.map(dir => fs.readdir(path.join(__dirname, dir))))
    filesToCopy = filesInGroups.map((group, i) => group.map(file => path.join(__dirname, dirsToCopy[i], file))).flat()
  } catch (err) {
    process.stderr.write(`\nUnable to read template files: ${err.stack ?? err.message}\n`)
  }

  try {
    await Promise.all(filesToCopy.map(dir => cp(dir, process.cwd())))
  } catch (err) {
    process.stderr.write(`\nUnable to copy files: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('OK')

  process.stdout.write('\n\nType \'npm start\' to launch the app\n')
}

main(process.argv.slice(2))
