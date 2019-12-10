const express = require('express')
const serverlessHTTP = require('serverless-http')
const RingCentral = require('ringcentral-js-concise').default
const Lambda = require('aws-sdk/clients/lambda')

const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER_URL)
rc.token({
  access_token: process.env.RINGCENTRAL_TOKEN
})

const app = express()
app.use(express.json())

app.post('/on-call-enter', async (req, res) => {
  console.log('/on-call-enter')
  const { partyId, sessionId } = req.body
  try {
    await rc.post(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}/play`, {
      resources: [
        {
          uri: 'http://chuntaoliu.com/rc-ivr-scripting-demo/greetings.wav'
        }
      ],
      interruptByDtmf: false,
      repeatCount: 1
    })
  } catch (e) {
    console.log(e.message.replace(/[\r\n]+/g, '\t'))
    try {
      await rc.get(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}`)
      console.log(`session ${sessionId} exists`)
    } catch (e) {
      console.log(`session ${sessionId} returns ${e.status} ${e.statusText}`)
    }
    try {
      await rc.get(`/restapi/v1.0/account/~/telephony/sessions/${sessionId}/parties/${partyId}`)
      console.log(`party ${partyId} exists`)
    } catch (e) {
      console.log(`party ${partyId} returns ${e.status} ${e.statusText}`)
    }
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

module.exports.app = serverlessHTTP(app)

const createAsyncProxy = functionName => {
  const lambda = new Lambda({ region: process.env.AWS_REGION })
  return async (event, context) => {
    const lambdaFunction = async () => {
      await lambda.invoke({
        FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME.replace(/-proxy$/, `-${functionName}`),
        InvocationType: 'Event',
        Payload: JSON.stringify(event)
      }).promise()
      return {
        statusCode: 204,
        headers: {
          'Validation-Token': event.headers['Validation-Token'],
          'Content-Type': 'text/html'
        },
        body: '<!doctype><html><body><script>close()</script><p>Please close this page</p></body></html>'
      }
    }
    console.log('proxy hit')
    return lambdaFunction()
  }
}

module.exports.proxy = createAsyncProxy('app')
