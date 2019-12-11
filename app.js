const express = require('express')
const RingCentral = require('ringcentral-js-concise').default

const app = express()
app.use(express.json())

const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER_URL)
rc.token({
  access_token: process.env.RINGCENTRAL_TOKEN
})

app.post('/on-call-enter', async (req, res) => {
  console.log('/on-call-enter', JSON.stringify(req.body))
  const { sessionId } = req.body
  const partyId = req.body.inParty.id
  try {
    const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
      resources: [
        {
          uri: 'http://chuntaoliu.com/rc-ivr-scripting-demo/greetings.wav'
        }
      ],
      interruptByDtmf: false,
      repeatCount: 1
    })
    console.log(`play command response body: ${JSON.stringify(r.data)}`)
  } catch (e) {
    console.log(e.message.replace(/[\r\n]+/g, '\t'))
  }
})

app.post('/on-call-exit', (req, res) => {
  console.log('/on-call-exit', JSON.stringify(req.body))
})

app.post('/on-command-update', async (req, res) => {
  console.log('/on-command-update', JSON.stringify(req.body))
  const { command, status, sessionId, partyId, parameters } = req.body
  if (command === 'Play' && status === 'Completed') {
    try {
      const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/collect`, {
        patterns: ['1', '2', '3'],
        timeout: 600000,
        interDigitTimeout: 2000
      })
      console.log(`collect command response body: ${JSON.stringify(r.data)}`)
    } catch (e) {
      console.log(e.message.replace(/[\r\n]+/g, '\t'))
    }
  } else if (command === 'Collect' && status === 'Completed' && parameters && parameters.digits) {
    console.log(`You chose ${parameters.digits}`)
  }
})

app.post('/on-command-error', (req, res) => {
  console.log('/on-command-error', JSON.stringify(req.body))
})

module.exports = app
