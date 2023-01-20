import process from '@socketsupply/socket-api/process'
import os from '@socketsupply/socket-api/os'
import Tonic from '@socketsupply/tonic'

if (process.env.DEBUG) {
  console.log('started in debug mode')
}

class AppContainer extends Tonic {
  render () {
    const platform = os.platform()

    return this.html`
      <h1>Hello, ${platform}!</h1>
    `
  }
}

window.addEventListener('DOMContentLoaded', () => {
  Tonic.add(AppContainer, 'app-container')
})
