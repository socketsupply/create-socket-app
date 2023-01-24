import './test-context'
import os from '@socketsupply/socket-api/os'
import { test } from '@socketsupply/tapzero'
import dom from '@socketsupply/test-dom'

test('test', async t => {
  const label1 = dom.qs('h1').textContent
  t.equal(label1, 'Hello, World', 'label on start is correct')

  // sleep 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000))

  const label2 = dom.qs('h1').textContent
  t.equal(label2, `Hello, ${os.platform()}!`, 'label after 3 seconds is correct')
})
