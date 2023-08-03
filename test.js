import test from 'node:test'
import assert from 'node:assert'
import tmp from 'p-temporary-directory'
import path from 'node:path'
import cp from 'node:child_process'
import os from 'node:os'
import desm from 'desm'

const __dirname = desm(import.meta.url)

const cliPath = path.join(__dirname, 'index.js')

test('test all the templates', async (t) => {
  let dir, cleanup
  t.beforeEach(async () => {
    [dir, cleanup] = await tmp()
  })

  t.afterEach(async () => {
    await cleanup()
  })

  const templates = ['tonic', 'react', 'react-ts', 'vanilla', 'vue', 'svelte']

  for (const template of templates) {
    await t.test(`${template} template`, async (t) => {
      await assert.doesNotReject(async () => {
        return new Promise((resolve, reject) => {
          const child = os.platform() === 'win32'
            ? cp.spawn('node', [cliPath, template], { cwd: dir })
            : cp.spawn(cliPath, [template], { cwd: dir })

          child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
          })

          child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
          })

          child.on('error', (error) => {
            reject(error)
          })

          child.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(`child process exited with code ${code}`))
            } else {
              resolve()
            }
          })
        })
      })
    })
  }
})
