#!/usr/bin/env node

import fs from 'node:fs/promises'
import util from 'node:util'
import path from 'node:path'
import { exec as ecp, spawn } from 'node:child_process'
import os from 'node:os'

const exec = util.promisify(ecp)
const __dirname = path.dirname(import.meta.url).replace(`file://${os.platform() === 'win32' ? '/' : ''}`, '')
const DEFAULT_TEMPLATE = 'vanilla'

async function copyFileOrFolder (source, target) {
  const stats = await fs.stat(source)

  if (stats.isFile()) {
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.copyFile(source, target)
  } else if (stats.isDirectory()) {
    await fs.mkdir(target, { recursive: true })

    const files = await fs.readdir(source)

    for (const file of files) {
      const sourceFile = path.join(source, file)
      const targetFile = path.join(target, file)

      await copyFileOrFolder(sourceFile, targetFile)
    }
  }
}

const cp = async (a, b) => copyFileOrFolder(
  path.resolve(a),
  path.join(b, path.basename(a))
)

async function help (templateNames) {
  console.log(`usage: npm create socket-app [${templateNames.join(' | ')}]`)
}

async function install () {
}

const DEFAULT_DEPS = [
]

const DEFAULT_DEV_DEPS = [
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
  devDeps: ['vite', '@vitejs/plugin-vue']
}
templates.svelte = {
  deps: ['svelte'],
  devDeps: ['vite', '@sveltejs/vite-plugin-svelte']
}
templates['react-ts'] = {
  deps: ['react', 'react-dom', 'typescript', '@types/react', '@types/react-dom', '@types/node'],
  devDeps: ['esbuild']
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
  // Create a package.json that has the module and a basic build setup.
  //
  try {
    process.stdout.write('Initializing npm package...')
    await exec('npm init -y')
  } catch (err) {
    process.stderr.write(`Unable to run npm init: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('Ok.\n')

  //
  // Install an opinionated base of modules for building a simple app.
  //
  const devDeps = [
    ...DEFAULT_DEV_DEPS,
    ...templates[templateName]?.devDeps ?? []
  ]

  if (devDeps.length > 0) {
    try {
      process.stdout.write('Installing developer dependencies...')
      await exec(`npm install -D ${devDeps.join(' ')}`)
    } catch (err) {
      process.stderr.write(`\nUnable to run npm install: ${err.stack ?? err.message}\n`)
      process.exit(1)
    }

    process.stdout.write('Ok.\n')
  }

  const deps = [
    ...DEFAULT_DEPS,
    ...templates[templateName]?.deps ?? []
  ]

  // remove eventually
  let isSocket05orGreater = true

  try {
    const { stdout } = await exec('ssc --version')

    try {
      const sscVersion = stdout.trim().split(' ')[0]
        // split by dot
        .split('.')
        // convert to numbers
        .map(s => parseInt(s))

      isSocket05orGreater = sscVersion[0] >= 1 || sscVersion[1] >= 5
    } catch (err) {}
  } catch (err) {
    process.stdout.write('Installing \'@socketsupply/socket\' locally (ssc not in PATH)\n')
    deps.push('@socketsupply/socket')
  }

  try {
    process.stdout.write('Installing dependencies...')
    await exec(`npm install ${deps.join(' ')} --save`)
  } catch (err) {
    process.stderr.write(`\nUnable to run npm install: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('Ok.\n')

  process.stdout.write('Adding package scripts...')
  let pkg

  try {
    pkg = JSON.parse(await fs.readFile('package.json'))
  } catch (err) {
    process.stderr.write(`\nUnable to read package.json: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }

  pkg.type = 'module'
  pkg.scripts['init-project'] = `ssc init${isSocket05orGreater ? ' --config' : ''}`
  pkg.scripts.start = 'ssc build -r -o'
  pkg.scripts.build = 'ssc build -o'
  pkg.scripts.test = 'ssc build -r -o --test=./test/index.js --headless'

  try {
    fs.writeFile('package.json', JSON.stringify(pkg, 2, 2))
  } catch (err) {
    process.stderr.write(`\nUnable to write package.json: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }

  process.stdout.write('Ok.\n')

  //
  // Initialize the current directory as a socket app.
  //
  try {
    process.stdout.write('Creating socket files...')
    // Use spawn so we can pass stdio, fte is interactive
    const initProcess = spawn(
      `npm${os.platform() === 'win32' ? '.cmd' : ''}`,
      ['run', 'init-project'],
      {
        stdio: [process.stdin, process.stdout, process.stderr]
      })
    await new Promise((resolve, reject) => {
      initProcess.on('close', resolve).on('error', reject)
    })
  } catch (err) {
    process.stderr.write(`\nUnable to create socket files: ${err.stack ?? err.message}\n`)
  }
  process.stdout.write('Ok.\n')

  //
  //  Initialize tsconfig.json when react_ts
  //
  if (templateName === 'react-ts') {
    try {
      process.stdout.write('Creating tsconfig...')
      await exec(
        'npx tsc --init --declaration --allowJs --emitDeclarationOnly --jsx react-jsx --lib "dom","dom.iterable","esnext" --outDir dist'
      )
    } catch (err) {
      process.stderr.write(
        `\nFailed to create tsconfig: ${err.stack ?? err.message}\n`
      )
      process.exit(1)
    }

    process.stdout.write('Ok.\n')

    try {
      process.stdout.write('Setting up TS configuration...')
      await fs.writeFile(
        'globals.d.ts',
        "declare module 'socket:os'; \ndeclare module 'socket:test'; \ndeclare module 'socket:console'; \ndeclare module 'socket:process';"
      )
    } catch (err) {
      process.stderr.write(
        `Failed to create global.d.ts: ${
          err.stack ?? err.message
        }.Please report this issue here: https://github.com/socketsupply/create-socket-app/issues\n`
      )
    }

    process.stdout.write('Ok.\n')
  }

  let config
  process.stdout.write('Updating project configuration...')

  try {
    config = await fs.readFile('socket.ini', 'utf8')
  } catch (err) {
    process.stderr.write(`\nUnable to read socket.ini: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }

  config = config.split('\n').map((line, i) => {
    if (line.includes('name = ')) {
      return line.replace(line, `name = "${pkg.name}"`)
    }
    if (line.includes('copy = ') && !line.startsWith(';')) {
      return line.replace(line, `; ${line}`)
    }
    if (line.includes('script = ')) {
      return line.replace(line, 'script = "node build.js"')
    }
    // Socket 0.5 compatibility
    if (isSocket05orGreater && line.includes('forward_arguments = ')) {
      return line.replace(line, 'forward_arguments = true')
    }
    return line
  }).join('\n')

  try {
    await fs.writeFile('socket.ini', config)
  } catch (err) {
    process.stderr.write(`\nUnable to write socket.ini: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('Ok.\n')

  process.stdout.write('Copying project boilerplate...')

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
  process.stdout.write('Ok.')

  process.stdout.write('\n\nType \'npm start\' to launch the app\n')
}

main(process.argv.slice(2))
