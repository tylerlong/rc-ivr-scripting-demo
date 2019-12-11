const express = require('express')
const RingCentral = require('ringcentral-js-concise').default

const app = express()
app.use(express.json())

const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER_URL)
rc.token({
  access_token: process.env.RINGCENTRAL_TOKEN
})

app.post('/on-call-enter', async (req, res) => {
  console.log('/on-call-enter')
  const { sessionId } = req.body
  const partyId = req.body.inParty.id
  try {
    const r1 = await rc.get(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}`)
    console.log(`session ${sessionId} exists: ${JSON.stringify(r1.data)}`)
  } catch (e) {
    console.log(`session ${sessionId} returns ${e.status} ${e.statusText}`)
  }
  try {
    const r2 = await rc.get(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}`)
    console.log(`party ${partyId} exists: : ${JSON.stringify(r2.data)}`)
  } catch (e) {
    console.log(`party ${partyId} returns ${e.status} ${e.statusText}`)
  }
  try {
    const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
      resources: [
        {
          uri: 'http://chuntaoliu.com/rc-ivr-scripting-demo/greetings.wav'
        }
      ],
      interruptByDtmf: false,
      repeatCount: 5
    })
    console.log(`play command response body: ${JSON.stringify(r.data)}`)
  } catch (e) {
    console.log(e.message.replace(/[\r\n]+/g, '\t'))
  }
})

app.post('/on-call-exit', (req, res) => {
  console.log('/on-call-exit')
  // res.status(204).send()
})

app.post('/on-command-update', (req, res) => {
  console.log('/on-command-update')
  // res.status(204).send()
})

app.post('/on-command-error', (req, res) => {
  console.log('/on-command-error')
  // res.status(204).send()
})

module.exports = app
