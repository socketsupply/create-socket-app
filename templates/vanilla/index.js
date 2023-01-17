import api from '@socketsupply/socket-api'

if (api.process.env.DEBUG) {
  console.log('started in debug mode')
}

window.addEventListener('DOMContentLoaded', () => {
  const os = api.os.platform()

  setTimeout(() => {
    const h1 = document.querySelector('h1')
    h1.textContent = `Hello, ${os}!`
  }, 2048)
})
