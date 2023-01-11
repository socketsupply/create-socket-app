import fs from 'node:fs'
import util from 'util'
import path from 'path'
import { exec as ecp } from 'child_process'

const exec = util.promisify(ecp)

const cp = async (a, b) => fs.promises.cp(
  path.resolve(a),
  path.join(b, path.basename(a)),
  { recursive: true, force: true }
)

async function install () {
}

async function main () {
  //
  // Check if the ssc command is installed, if not install it.
  //
  try {
    await exec('ssc')
  } catch (err) {
    if (err.code === 127) install()
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
    const entries = (await fs.promises.readdir(process.cwd()))
      .filter(file => !accepted.includes(file))

    if (entries.length) {
      process.stdout.write('\nThe current directory is not empty\n')
      process.exit(1)
    }
  } catch (err) {
    process.stdout.write(`\nUnable to read the current directory: ${err.message}\n`)
    process.exit(1)
  }

  //
  // Initialize the current directory as a socket app.
  //
  try {
    process.stdout.write('\nCreating socket files...')
    await exec('ssc init')
  } catch (err) {
    process.stdout.write(`\nUnable to create socket files: ${err.message}\n`)
  }
  process.stdout.write('OK')

  //
  // Create a package.json that has the io module and a basic build setup.
  //
  try {
    process.stdout.write('\nInitializing npm package...')
    await exec('npm init -y')
  } catch (err) {
    process.stdout.write(`\nUnable to run npm init: ${err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('OK')

  const packages = [
    '@socketsupply/socket-api',
    'esbuild'
  ]

  //
  // Install an opinionated base of modules for building a simple app.
  //
  try {
    process.stdout.write('\nInstalling dependencies...')
    await exec(`npm install ${packages.join(' ')}`)
  } catch (err) {
    process.stdout.write(`\nUnable to run npm init: ${err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('OK')

  process.stdout.write('\nAdding package scripts...')
  let pkg

  try {
    pkg = JSON.parse(await fs.promises.readFile('package.json'))
  } catch (err) {
    process.stdout.write(`\nUnable to read package.json: ${err.message}\n`)
    process.exit(1)
  }

  pkg.type = 'module'
  pkg.scripts.start = 'ssc build -r'

  try {
    fs.promises.writeFile('package.json', JSON.stringify(pkg, 2, 2))
  } catch (err) {
    process.stdout.write(`\nUnable to write package.json: ${err.message}\n`)
    process.exit(1)
  }
  process.stdout.write('OK')

  let config
  process.stdout.write('\nUpdating project configuration...')

  try {
    config = await fs.promises.readFile('socket.ini', 'utf8')
  } catch (err) {
    process.stdout.write(`\nUnable to read socket.ini: ${err.message}\n`)
    process.exit(1)
  }

  const oldCommand = '; build = "node build-script.js"'
  const newCommand = 'build = "node build.js"'

  try {
    await fs.promises.writeFile('socket.ini', config.replace(oldCommand, newCommand))
  } catch (err) {
    process.stdout.write(`\nUnable to write socket.ini: ${err.message}\n`)
    process.exit(1)
  }

  process.stdout.write('OK')
  process.stdout.write('\nCopying project boilerplate...')

  try {
    const url = new URL(path.dirname(import.meta.url))
    const buildScript = path.join(url.pathname, 'fixtures', 'build.js')
    await cp(buildScript, process.cwd())

    const indexScript = path.join(url.pathname, 'fixtures', 'index.js')
    await cp(indexScript, path.join(process.cwd(), 'src'))

    const indexHTML = path.join(url.pathname, 'fixtures', 'index.html')
    await cp(indexHTML, path.join(process.cwd(), 'src'))

    const indexCSS = path.join(url.pathname, 'fixtures', 'index.css')
    await cp(indexCSS, path.join(process.cwd(), 'src'))

    const icon = path.join(url.pathname, 'fixtures', 'icon.png')
    await cp(icon, path.join(process.cwd(), 'src'))
  } catch (err) {
    process.stdout.write(`\nUnable to copy build.js: ${err.message}\n`)
    process.exit(1)
  }

  process.stdout.write('OK\n')

  process.stdout.write('\nTry \'npm start\' to launch the app\n')
}

main()
