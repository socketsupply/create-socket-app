import './test-context'
import { test } from 'socket:test'
import os from 'socket:os'

test('test', async t => {
  const label1 = document.querySelector('h1').textContent
  t.equal(label1, 'Hello, World', 'label on start is correct')

  // sleep 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000))

  const label2 = document.querySelector('h1').textContent
  t.equal(label2, `Hello, ${os.platform()}!`, 'label after 3 seconds is correct')
})
