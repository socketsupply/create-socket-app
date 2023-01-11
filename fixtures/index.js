import api from '@socketsupply/socket-api'

if (api.process.env.DEBUG) {
  console.log('started in debug mode')
}

window.addEventListener('DOMContentLoaded', () => {
  const os = api.os.platform()
  const h1 = document.createElement('h1')
  h1.textContent = `Hello, ${os}!`
  document.body.appendChild(h1)
})
