import process from 'socket:process'
import os from 'socket:os'

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
