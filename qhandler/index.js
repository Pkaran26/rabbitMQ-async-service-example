const express = require('express')
const cors = require('cors')
const rmqServer = require('./rmq-server')

const app = express()

const taskQueue = 'requestQueue'
const serviceQueues = ['blogQueue', 'productQueue']
rmqServer(taskQueue, serviceQueues)

app.use(express.json())
app.use(cors())

app.listen(5000, ()=>{
  console.log('listening on port 5000')
})