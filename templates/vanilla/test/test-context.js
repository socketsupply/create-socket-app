import { GLOBAL_TEST_RUNNER } from 'socket:test'
import console from 'socket:console'
import process from 'socket:process'
import 'socket:runtime'

// uncomment below to get IPC debug output in stdout
// import ipc from 'socket:ipc.js'
// ipc.debug.enabled = true
// ipc.debug.log = (...args) => console.log(...args)

globalThis.addEventListener('error', onerror)
globalThis.addEventListener('unhandledrejection', onerror)

function onerror (err) {
  console.error(err.stack ?? err.reason ?? err.message ?? err)
  process.exit(1)
}

GLOBAL_TEST_RUNNER.onFinish(() => process.exit(0))
