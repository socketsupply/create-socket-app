import { GLOBAL_TEST_RUNNER } from '@socketsupply/tapzero'
import console from '@socketsupply/socket-api/console.js'
import process from '@socketsupply/socket-api/process.js'
import '@socketsupply/socket-api/runtime.js'

// uncomment below to get IPC debug output in stdout
// import ipc from '@socketsupply/socket-api/ipc.js'
// ipc.debug.enabled = true
// ipc.debug.log = (...args) => console.log(...args)

globalThis.addEventListener('error', onerror)
globalThis.addEventListener('unhandledrejection', onerror)

function onerror (err) {
  console.error(err.stack ?? err.reason ?? err.message ?? err)
  process.exit(1)
}

GLOBAL_TEST_RUNNER.onFinish(() => process.exit(0))
