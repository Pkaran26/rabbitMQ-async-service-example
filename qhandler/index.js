const express = require('express')
const cors = require('cors')
const rmqServer = require('./rmq-server')

const app = express()
rmqServer()

app.use(express.json())
app.use(cors())

app.listen(5000, ()=>{
  console.log('listening on port 5000')
})