const express = require('express')
const serverlessHTTP = require('serverless-http')

const app = express()
app.get('/hello', (req, res) => {
  res.send('world')
})

app.post('/on-call-enter', (req, res) => {
  res.send('on-call-enter')
})

app.post('/on-call-exit', (req, res) => {

})

app.post('/on-command-update', (req, res) => {

})

app.post('/on-command-error', (req, res) => {

})

module.exports.app = serverlessHTTP(app)
