const express = require('express')
const RingCentral = require('@ringcentral/sdk').SDK

const { Session } = require('./models')

const app = express()
app.use(express.json())

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL
})
rc.platform().auth().setData({
  access_token: process.env.RINGCENTRAL_TOKEN,
  expires_in: 999999999,
  refresh_token_expires_in: 999999999
})

const playAudio = async (session, audioName, interruptByDtmf = false) => {
  const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${session.sessionId}/parties/${session.partyId}/play`, {
    resources: [
      {
        uri: `http://chuntaoliu.com/rc-ivr-scripting-demo/${audioName}.wav`
      }
    ],
    interruptByDtmf,
    repeatCount: 1
  })
  const json = await r.json()
  console.log(`play command response body: ${JSON.stringify(json)}`)
  await session.update({
    data: { ...session.data, [audioName + 'Id']: json.id }
  })
  return json
}

const askQuestion = async session => {
  await playAudio(session, 'question', true)
  await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${session.sessionId}/parties/${session.partyId}/collect`, {
    patterns: ['1', '2', '3'],
    timeout: 600000,
    interDigitTimeout: 2000
  })
}

app.post('/on-call-enter', async (req, res) => {
  console.log('/on-call-enter', JSON.stringify(req.body))
  const { sessionId } = req.body
  const partyId = req.body.inParty.id
  const session = await Session.create({
    sessionId,
    partyId
  })
  await playAudio(session, 'greetings')
})

app.post('/on-command-update', async (req, res) => {
  console.log('/on-command-update', JSON.stringify(req.body))
  const { command, commandId, status, sessionId, partyId, parameters } = req.body
  const session = await Session.findOne({ where: { sessionId, partyId } })
  if (session === null) {
    return
  }
  if (command === 'Play' && (status === 'Completed' || status === 'Interrupted')) {
    if (session.data.greetingsId === commandId) { // After playing greetings
      await askQuestion(session)
    } else if (session.data.colorId === commandId) { // After playing color confirmation
      await playAudio(session, 'bye')
    } else if (session.data.invalidId === commandId) { // after playing invalid
      await askQuestion(session)
    }
  } else if (command === 'Collect' && status === 'Completed' && parameters && parameters.digits) {
    const color = { 1: 'red', 2: 'green', 3: 'blue' }[parameters.digits]
    const json = await playAudio(session, color)
    await session.update({
      data: { ...session.data, colorId: json.id }
    })
  } else if (command === 'Collect' && status === 'Not Found') {
    await playAudio(session, 'invalid')
  }
})

app.post('/on-call-exit', (req, res) => {
  console.log('/on-call-exit', JSON.stringify(req.body))
})

app.post('/on-command-error', (req, res) => {
  console.log('/on-command-error', JSON.stringify(req.body))
})

app.put('/setup-database', async (req, res) => {
  console.log('/setup-database')
  await Session.sync()
})

module.exports = app
