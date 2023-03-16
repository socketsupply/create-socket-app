#!/usr/bin/env node

import fs from 'node:fs/promises'
import util from 'node:util'
import path from 'node:path'
import { exec as ecp, spawn } from 'node:child_process'
import os from 'node:os'
import chalk from 'chalk'

const exec = util.promisify(ecp)
const __dirname = path.dirname(import.meta.url).replace(`file://${os.platform() === 'win32' ? '/' : ''}`, '')
const DEFAULT_TEMPLATE = 'vanilla'

const cp = async (a, b) => fs.cp(
  path.resolve(a),
  path.join(b, path.basename(a)),
  { recursive: true, force: true }
)

const exists = async (path) => {
  try {
    await fs.access(path)
    return true
  } catch {}
  return false
}

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
    console.error(chalk.redBright(`Unable to find template "${templateName}"`))// chalk error
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

    // if (entries.length) {
    //   process.stdout.write(chalk.yellowBright('\nThe current directory is not empty\n'))// chalk warning
    //   process.exit(1)
    // }
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to read the current directory: ${err.stack ?? err.message}\n`))// chalk error
    process.exit(1)
  }

  //
  // Create a package.json that has the module and a basic build setup.
  //
  try {
    process.stdout.write(chalk.whiteBright('Initializing npm package...'))// chalk info
    await exec('npm init -y')
  } catch (err) {
    process.stderr.write(chalk.redBright(`Unable to run npm init: ${err.stack ?? err.message}\n`))// chalk error
    process.exit(1)
  }
  process.stdout.write(chalk.greenBright('Ok.\n'))// chalk success

  //
  // Install an opinionated base of modules for building a simple app.
  //
  const devDeps = [
    ...DEFAULT_DEV_DEPS,
    ...templates[templateName]?.devDeps ?? []
  ]

  if (devDeps.length > 0) {
    try {
      process.stdout.write(chalk.whiteBright('Installing developer dependencies...'))// chalk info
      await exec(`npm install -D ${devDeps.join(' ')}`)
    } catch (err) {
      process.stderr.write(chalk.redBright(`\nUnable to run npm install: ${err.stack ?? err.message}\n`))// chalk error
      process.exit(1)
    }

    process.stdout.write(chalk.greenBright('Ok.\n'))// chalk success
  }

  const deps = [
    ...DEFAULT_DEPS,
    ...templates[templateName]?.deps ?? []
  ]

  try {
    await exec('ssc --version')
  } catch (err) {
    process.stdout.write(chalk.whiteBright(`Installing ${chalk.redBright("'@socketsupply/socket'")} locally (ssc not in PATH)\n`))// chalk info
    deps.push('@socketsupply/socket')
  }

  try {
    process.stdout.write(chalk.whiteBright('Installing dependencies...\n'))// chalk info
    await exec(`npm install ${deps.join(' ')} --save`)

    const platformPackage = `./node_modules/@socketsupply/socket-${os.platform()}-${os.arch()}`
    const platformScript = 'bin/install-pre-reqs.js'

    if (await exists(path.join(platformPackage, platformScript))) {
      console.log(chalk.whiteBright(`running pre req script at ${path.join(platformPackage, platformScript)}`))// chalk info
      // spawn pre-reqs process so it can inherit stdin, npm install support this
      const preResProcess = spawn(
        'node',
        [platformScript, 'install'],
        {
          cwd: platformPackage,
          stdio: [process.stdin, process.stdout, process.stderr]
        })
      await new Promise((resolve, reject) => {
        preResProcess.on('close', resolve).on('error', reject)
      })
    }
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to run npm install: ${err.stack ?? err.message}\n`))// chalk error
    process.exit(1)
  }
  process.stdout.write(chalk.greenBright('Ok.\n'))// chalk success

  process.stdout.write(chalk.whiteBright('Adding package scripts...'))// chalk info
  let pkg

  try {
    pkg = JSON.parse(await fs.readFile('package.json'))
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to read package.json: ${err.stack ?? err.message}\n`))// chalk error
    process.exit(1)
  }

  pkg.type = 'module'
  pkg.scripts['init-project'] = 'ssc init'
  pkg.scripts.start = 'ssc build -r -o'
  pkg.scripts.build = 'ssc build -o'
  pkg.scripts.test = 'ssc build -r -o --test=./test/index.js --headless'

  try {
    fs.writeFile('package.json', JSON.stringify(pkg, 2, 2))
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to write package.json: ${err.stack ?? err.message}\n`))// chalk error
    process.exit(1)
  }

  process.stdout.write(chalk.greenBright('Ok.\n'))//chalk success

  //
  // Initialize the current directory as a socket app.
  //
  try {
    process.stdout.write(chalk.whiteBright('Creating socket files...'))// chalk info
    await exec('npm run init-project')
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to create socket files: ${err.stack ?? err.message}\n`))// chalk error
  }
  process.stdout.write(chalk.greenBright('Ok.\n'))// chalk success

  //
  //  Initialize tsconfig.json when react-ts
  //
  if (templateName === 'react-ts') {
    try {
      process.stdout.write(chalk.blueBright('Creating tsconfig...'))// chalk ts
      await exec(
        'npx tsc --init --declaration --allowJs --emitDeclarationOnly --jsx react-jsx --lib "dom","dom.iterable","esnext" --outDir dist'
      )
    } catch (err) {
      process.stderr.write(
        chalk.redBright(`\nFailed to create tsconfig: ${err.stack ?? err.message}\n`)// chalk error
      )
      process.exit(1)
    }

    process.stdout.write(chalk.greenBright('Ok.\n'))// chalk success

    try {
      process.stdout.write(chalk.blueBright('Setting up TS configuration...'))// chalk ts
      await fs.writeFile(
        'globals.d.ts',
        "declare module 'socket:os'; \ndeclare module 'socket:test'; \ndeclare module 'socket:console'; \ndeclare module 'socket:process';"
      )
    } catch (err) {
      process.stderr.write(
        chalk.redBright(`Failed to create global.d.ts: ${
          err.stack ?? err.message
        }.Please report this issue here: https://github.com/socketsupply/create-socket-app/issues\n`)// chalk error
      )
    }

    process.stdout.write(chalk.greenBright('Ok.\n'))// chalk success
  }

  let config
  process.stdout.write(chalk.whiteBright('Updating project configuration...'))// chalk info

  try {
    config = await fs.readFile('socket.ini', 'utf8')
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to read socket.ini: ${err.stack ?? err.message}\n`))// chalk error
    process.exit(1)
  }

  const oldCommand = '; script = "node build-script.js"'
  const newCommand = 'script = "node build.js"'
  const oldName = 'name = "beepboop"'
  const newName = `name = "${pkg.name}"`

  config = config
    .replace(oldCommand, newCommand)
    .replace(oldName, newName)

  try {
    await fs.writeFile('socket.ini', config)
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to write socket.ini: ${err.stack ?? err.message}\n`))// chalk error
    process.exit(1)
  }
  process.stdout.write(chalk.greenBright('Ok.\n'))// chalk success

  process.stdout.write(chalk.whiteBright('Copying project boilerplate...'))// chalk info

  const dirsToCopy = [
    'common',
    `templates/${templateName}`
  ]

  let filesToCopy
  try {
    const filesInGroups = await Promise.all(dirsToCopy.map(dir => fs.readdir(path.join(__dirname, dir))))
    filesToCopy = filesInGroups.map((group, i) => group.map(file => path.join(__dirname, dirsToCopy[i], file))).flat()
  } catch (err) {
    process.stderr.write(chalk.redBright(`\nUnable to read template files: ${err.stack ?? err.message}\n`))// chalk error
  }

  try {
    await Promise.all(filesToCopy.map(dir => cp(dir, process.cwd())))
  } catch (err) {
    process.stderr.write(`\nUnable to copy files: ${err.stack ?? err.message}\n`)
    process.exit(1)
  }
  process.stdout.write(chalk.greenBright('Ok.'))// chalk success

  process.stdout.write(chalk.bold.whiteBright(`\n\nType\ ${chalk.yellowBright("'npm start'")}\ to launch the app\n`))// chalk info
}

main(process.argv.slice(2))
