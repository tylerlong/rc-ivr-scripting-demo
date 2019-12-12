const express = require('express')
const RingCentral = require('@ringcentral/sdk').SDK

const { Session } = require('./models')

const app = express()
app.use(express.json())

const rc = new RingCentral({
  clientId: '',
  clientSecret: '',
  server: process.env.RINGCENTRAL_SERVER_URL
})
rc.platform().auth().setData({
  access_token: process.env.RINGCENTRAL_TOKEN,
  expires_in: 999999999,
  refresh_token_expires_in: 999999999
})

app.post('/on-call-enter', async (req, res) => {
  console.log('/on-call-enter', JSON.stringify(req.body))
  const { sessionId } = req.body
  const partyId = req.body.inParty.id
  const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
    resources: [
      {
        uri: 'http://chuntaoliu.com/rc-ivr-scripting-demo/greetings.wav'
      }
    ],
    interruptByDtmf: false,
    repeatCount: 1
  })
  const json = await r.json()
  console.log(`play command response body: ${JSON.stringify(json)}`)
  await Session.create({
    sessionId,
    partyId,
    data: {
      greetingId: json.id
    }
  })
})

app.post('/on-call-exit', (req, res) => {
  console.log('/on-call-exit', JSON.stringify(req.body))
})

const playQuestion = async session => {
  const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${session.sessionId}/parties/${session.partyId}/play`, {
    resources: [
      {
        uri: 'http://chuntaoliu.com/rc-ivr-scripting-demo/question.wav'
      }
    ],
    interruptByDtmf: false,
    repeatCount: 1
  })
  const json = await r.json()
  await session.update({
    data: { ...session.data, questionId: json.id }
  })
}

app.post('/on-command-update', async (req, res) => {
  console.log('/on-command-update', JSON.stringify(req.body))
  const { command, commandId, status, sessionId, partyId, parameters } = req.body
  const session = await Session.findOne({ where: { sessionId, partyId } })
  if (session === null) {
    return
  }
  if (command === 'Play' && status === 'Completed') {
    if (session.data.greetingId === commandId) { // After playing greeting
      await playQuestion(session)
    } else if (session.data.questionId === commandId) { // After playing question
      await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/collect`, {
        patterns: ['1', '2', '3'],
        timeout: 600000,
        interDigitTimeout: 2000
      })
    } else if (session.data.colorId === commandId) { // After playing color confirmation
      await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
        resources: [
          {
            uri: 'http://chuntaoliu.com/rc-ivr-scripting-demo/bye.wav'
          }
        ],
        interruptByDtmf: false,
        repeatCount: 1
      })
    } else if (session.data.invalidId === commandId) { // after playing invalid
      await playQuestion(session)
    }
  } else if (command === 'Collect' && status === 'Completed' && parameters && parameters.digits) {
    const color = { 1: 'red', 2: 'green', 3: 'blue' }[parameters.digits]
    const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
      resources: [
        {
          uri: `http://chuntaoliu.com/rc-ivr-scripting-demo/${color}.wav`
        }
      ],
      interruptByDtmf: false,
      repeatCount: 1
    })
    const json = await r.json()
    await session.update({
      data: { ...session.data, colorId: json.id }
    })
  } else if (command === 'Collect' && status === 'Not Found') {
    const r = await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
      resources: [
        {
          uri: 'http://chuntaoliu.com/rc-ivr-scripting-demo/invalid.wav'
        }
      ],
      interruptByDtmf: false,
      repeatCount: 1
    })
    const json = await r.json()
    await session.update({
      data: { ...session.data, invalidId: json.id }
    })
  }
})

app.post('/on-command-error', (req, res) => {
  console.log('/on-command-error', JSON.stringify(req.body))
})

app.put('/setup-database', async (req, res) => {
  console.log('/setup-database')
  await Session.sync()
  console.log('/setup-database done')
})

module.exports = app
