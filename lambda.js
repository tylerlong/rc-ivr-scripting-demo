const serverlessHTTP = require('serverless-http')
const Lambda = require('aws-sdk/clients/lambda')

const app = require('./app')
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

module.exports.maintain = (event, context) => {
  // todo: clean up the database
}
