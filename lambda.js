const serverlessHTTP = require('serverless-http')
const Lambda = require('aws-sdk/clients/lambda')
const Sequelize = require('sequelize')

const app = require('./app')
const { Session } = require('./models')

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
      console.log('return to IVR server side')
      return {
        statusCode: 204
      }
    }
    console.log('proxy hit')
    return lambdaFunction()
  }
}

module.exports.proxy = createAsyncProxy('app')

module.exports.maintain = async (event, context) => {
  await Session.destroy({ // delete records older than 1 hour
    where: {
      created_at: {
        [Sequelize.Op.lt]: new Date(Date.now() - 60 * 60 * 1000)
      }
    }
  })
}
