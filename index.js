#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const NPM = 'npm'

const CSP = `
<meta
  http-equiv="Content-Security-Policy"
  content="
    connect-src https: file: ipc: socket: ws://localhost:*;
    script-src https: socket: http://localhost:* 'unsafe-eval';
    img-src https: data: file: http://localhost:*;
    child-src 'none';
    object-src 'none';
  "
>`

function getPackageManager (userAgent) {
  if (typeof userAgent !== 'string') return NPM
  const [packageManager] = userAgent.split(' ')
  const [packageManagerName] = packageManager.split('/')
  return packageManagerName ?? NPM
}

function getViteCreateCommand ({ packageManager, projectName = '', restViteOptions }) {
  const rest = restViteOptions.length === 0
    ? ''
    : ` ${packageManager === NPM ? '--' : ''} ${restViteOptions.join(' ')}`
  return `${packageManager} create vite@latest ${projectName}${rest}`
}

const [projectName, ...restViteOptions] = process.argv.slice(2)
const packageManager = getPackageManager(process.env.npm_config_user_agent)
const viteCreateCommand = getViteCreateCommand({
  packageManager,
  projectName,
  restViteOptions
})

process.stdout.write(`\nCreating a vite project with command:\n${viteCreateCommand}\n\n`)

const viteProcess = spawn(viteCreateCommand, [], {
  shell: true,
  stdio: 'inherit',
  encoding: 'utf-8'
})

viteProcess.on('close', (code) => {
  const cwd = resolve(process.cwd(), projectName)

  try {
    execSync('ssc --version', {
      stdio: 'ignore'
    })
  } catch {
    process.stdout.write('Installing \'@socketsupply/socket\' locally (ssc not in PATH)\n\n')
    execSync('npm install @socketsupply/socket --save-dev')
  }

  try {
    execSync('npm install', {
      cwd,
      stdio: 'inherit'
    })
  } catch (error) {
    // create-vite operation was cancelled
    if (error.code === 'ENOENT') process.exit(0)
  }

  process.stdout.write('\nAdding the socket.ini file to the project\n')

  execSync(`ssc init --name=${projectName}`, {
    cwd,
    stdio: 'inherit'
  })

  process.stdout.write('\nPatching socket.ini for the create-vite\n')

  const socketIniPath = resolve(cwd, 'socket.ini')
  const socketIni = readFileSync(socketIniPath, 'utf-8')
  const modifiedSocketIni = socketIni
    .replace(
      'copy = "src"',
      'copy = "dist"'
    )
    .replace(
      '; script = "npm run build"',
      'script = "npm run build"'
    )
  writeFileSync(socketIniPath, modifiedSocketIni, 'utf8')

  process.stdout.write('\nPatching index.html for the create-vite\n')

  const indexHTMLPath = resolve(cwd, 'index.html')
  const indexHTML = readFileSync(indexHTMLPath, 'utf-8')
  const modifiedData = indexHTML.replace('<head>', '<head>\n' + CSP + '\n')
  writeFileSync(indexHTMLPath, modifiedData, 'utf8')

  // So TypeScript doesn't complain about about String#startsWith in the vite.config.ts
  if (existsSync(resolve(cwd, 'tsconfig.node.json'))) {
    process.stdout.write('\nPatching tsconfig.node.json\n')

    const tsconfigNodeJSONPath = resolve(cwd, 'tsconfig.node.json')
    const tsconfigNodeJSON = readFileSync(tsconfigNodeJSONPath, 'utf-8')

    if (!tsconfigNodeJSON.includes('"lib": ["ESNext"],')) {
      const modifiedTsconfigNodeJSON = tsconfigNodeJSON.replace(
        '"compilerOptions": {',
        '"compilerOptions": {\n    "lib": ["ESNext"],'
      )
      writeFileSync(tsconfigNodeJSONPath, modifiedTsconfigNodeJSON, 'utf8')
    }
  }

  let isViteConfigExists = false
  ['js', 'ts'].forEach((ext) => {
    // patching the vite.config.js to make socket:* modules external
    if (existsSync(resolve(cwd, `vite.config.${ext}`))) {
      process.stdout.write('\nPatching vite.config.' + ext + '\n')

      const viteConfigPath = resolve(cwd, 'vite.config.js')
      const viteConfig = readFileSync(viteConfigPath, 'utf-8')

      // make socket:* modules external for build
      if (!viteConfig.includes('external(id)')) {
        const modifiedViteConfig = viteConfig.replace(
          'defineConfig({',
          'defineConfig({\n  build: {\n    rollupOptions: {\n      external(id) {\n        return id.startsWith(\'socket:\')\n      }\n    }\n  },'
        )
        writeFileSync(viteConfigPath, modifiedViteConfig, 'utf8')
      }
    }
    isViteConfigExists = true
  })

  if (!isViteConfigExists) {
    process.stdout.write('\nCreating vite.config.js\n')

    const viteConfigPath = resolve(cwd, 'vite.config.js')
    const viteConfig = `
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external(id) {
        return id.startsWith('socket:')
      }
    }
  },
})
`
    writeFileSync(viteConfigPath, viteConfig, 'utf8')
  }


  process.stdout.write(`\nDone!\n\nBuild and run your app with:\nssc build -r ${projectName}`)
})
