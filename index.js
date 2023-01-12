import fs from 'node:fs'
import util from 'util'
import path from 'path'
import { exec as ecp } from 'child_process'

const exec = util.promisify(ecp)
const __dirname = new URL(path.dirname(import.meta.url)).pathname

const cp = async (a, b) => fs.promises.cp(
  path.resolve(a),
  path.join(b, path.basename(a)),
  { recursive: true, force: true }
)

async function help (templateNames) {
  console.log(`usage: create-socket-app <${templateNames.join(' | ')}>`)
}

async function install () {
}

const templates = {}

templates.vanilla = async () => {
  const src = path.join(__dirname, 'templates', 'vanilla')
  const buildScript = path.join(src, 'build.js')

  await cp(buildScript, process.cwd())
  await cp(path.join(src, 'index.js'), path.join(process.cwd(), 'src'))
  await cp(path.join(src, 'index.html'), path.join(process.cwd(), 'src'))
  await cp(path.join(src, 'index.css'), path.join(process.cwd(), 'src'))
  await cp(path.join(src, 'icon.png'), path.join(process.cwd(), 'src'))
}

async function main (argv) {
  const templateNames = await fs.promises.readdir(path.join(__dirname, 'templates'))

  if (!argv.length || argv.find(s => s.includes('-h'))) {
    return help(templateNames)
  }

  if (argv[0] && templateNames.findIndex(s => s === argv[0]) === -1) {
    console.error(`Unable to find template "${argv[0]}"`)
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
  const oldName = 'name = "beepboop"'
  const newName = `name = "${pkg.name}"`

  config = config
    .replace(oldCommand, newCommand)
    .replace(oldName, newName)

  try {
    await fs.promises.writeFile('socket.ini', config)
  } catch (err) {
    process.stdout.write(`\nUnable to write socket.ini: ${err.message}\n`)
    process.exit(1)
  }

  process.stdout.write('OK')
  process.stdout.write('\nCopying project boilerplate...')

  try {
    await templates[argv[0]]()
  } catch (err) {
    process.stdout.write(`\nUnable to copy build.js: ${err.message}\n`)
    process.exit(1)
  }

  process.stdout.write('OK\n')

  process.stdout.write('\nTry \'npm start\' to launch the app\n')
}

main(process.argv.slice(2))
