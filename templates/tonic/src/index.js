import Tonic from '@socketsupply/tonic'

import process from 'socket:process'
import os from 'socket:os'

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

Tonic.add(AppContainer, 'app-container')
