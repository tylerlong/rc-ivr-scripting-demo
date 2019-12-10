const express = require('express')
const serverlessHTTP = require('serverless-http')
const RingCentral = require('ringcentral-js-concise').default
// const RingCentral = require('@ringcentral/sdk').SDK

// const rc = new RingCentral({
//   server: process.env.RINGCENTRAL_SERVER_URL,
//   clientId: 'fake',
//   clientSecret: 'fake'
// })
// rc.platform().auth().setData({
//   access_token: process.env.RINGCENTRAL_TOKEN,
//   expire_time: Date.now() + 99999999999,
//   refresh_token: 'fake'
// })

const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER_URL)
rc.token({
  access_token: process.env.RINGCENTRAL_TOKEN
})

const app = express()
app.use(express.json())

app.post('/on-call-enter', async (req, res) => {
  console.log('/on-call-enter')
  const { partyId, sessionId } = req.body
  await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
    resources: [
      {
        uri: 'http://example.com/ivr-app-example/greeting.wav'
      }
    ],
    interruptByDtmf: false,
    repeatCount: 1
  })
  res.status(204).send()
})

app.post('/on-call-exit', (req, res) => {
  console.log('/on-call-exit')
  res.status(204).send()
})

app.post('/on-command-update', (req, res) => {
  console.log('/on-command-update')
  res.status(204).send()
})

app.post('/on-command-error', (req, res) => {
  console.log('/on-command-error')
  res.status(204).send()
})

module.exports.app = serverlessHTTP(app)
