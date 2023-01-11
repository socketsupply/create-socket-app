import fs from 'node:fs'
import util from 'util'
import { exec as ecp } from 'child_process'

const exec = util.promisify(ecp)

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
    const entries = (await fs.promises
      .readdir(process.cwd()))
      .filter(file => !accepted.includes(file))

    if (entries.length) {
      process.stdout.write('\nThe current directory is not empty')
      process.exit(1)
    }
  } catch (err) {
    process.stdout.write(`\nUnable to read the current directory: ${err.message}`)
    process.exit(1)
  }

  //
  // Initialize the current directory as a socket app.
  //
  try {
    process.stdout.write('\nCreating socket files...')
    await exec('ssc init')
  } catch (err) {
    process.stdout.write(`\nUnable to create socket files: ${err.message}`)
  }
  process.stdout.write('OK')

  //
  // Create a package.json that has the io module and a basic build setup.
  //
  try {
    process.stdout.write('\nInitializing npm package...')
    await exec('npm init -y')
  } catch (err) {
    process.stdout.write(`\nUnable to run npm init: ${err.message}`)
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
    process.stdout.write(`\nUnable to run npm init: ${err.message}`)
    process.exit(1)
  }

  process.stdout.write('OK\n')
}

main()
