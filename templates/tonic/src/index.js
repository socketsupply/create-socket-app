import api from '@socketsupply/socket-api'
import Tonic from '@socketsupply/tonic'
import { Components } from '@socketsupply/components'

if (api.process.env.DEBUG) {
  console.log('started in debug mode')
}

class AppContainer extends Tonic {
  render () {
    const os = api.os.platform()

    return this.html`
      <h1>Hello, ${os}!</h1>
    `
  }
}

window.addEventListener('DOMContentLoaded', () => {
  Components(Tonic)
  Tonic.add(AppContainer)
})
