import process from 'socket:process'
import os from 'socket:os'

import { createRoot } from 'react-dom/client'
import React from 'react'

if (process.env.DEBUG) {
  console.log('started in debug mode')
}

function AppContainer () {
  return <h1>Hello, {os.platform()}!</h1>
}

const root = createRoot(document.getElementById('root'))
root.render(<AppContainer />)
