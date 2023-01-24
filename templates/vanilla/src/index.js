import process from '@socketsupply/socket-api/process'
import os from '@socketsupply/socket-api/os'

if (process.env.DEBUG) {
  console.log('started in debug mode')
}

window.addEventListener('DOMContentLoaded', () => {
  const platform = os.platform()

  setTimeout(() => {
    const h1 = document.querySelector('h1')
    h1.textContent = `Hello, ${platform}!`
  }, 2048)
})
