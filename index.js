const express = require('express')
const serverlessHTTP = require('serverless-http')

const app = express()

app.post('/on-call-enter', (req, res) => {
  console.log('/on-call-enter')
  res.send('/on-call-enter')
})

app.post('/on-call-exit', (req, res) => {
  console.log('/on-call-exit')
  res.send('/on-call-exit')
})

app.post('/on-command-update', (req, res) => {
  console.log('/on-command-update')
  res.send('/on-command-update')
})

app.post('/on-command-error', (req, res) => {
  console.log('/on-command-error')
  res.send('/on-command-error')
})

module.exports.app = serverlessHTTP(app)
