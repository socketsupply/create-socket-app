import './test-context'
import os from '@socketsupply/socket-api/os'
import { test } from '@socketsupply/tapzero'
import dom from '@socketsupply/test-dom'

test('test', async t => {
  const label = dom.qs('#root > h1').textContent
  t.equal(label, `Hello, ${os.platform()}!`, 'label after 3 seconds is correct')
})
