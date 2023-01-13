const express = require('express')
const cors = require('cors')
const clientService = require('./client')
const fs = require('fs')
const {extractData} = require('./utils/helper')

const app = express()

app.use(express.json())
app.use(cors())

app.get('/api/:service_type/:api_name/:type', async (req, res)=>{
  const {service_type, type} = req.params
  const payload = extractData(req)
  await clientService(service_type, payload, type, (data)=>{
    res.json(JSON.parse(data))
  })
})

app.get('/api/status/:jobID', async (req, res)=>{
  fs.readFile('./cache.txt', function(err, cache) {
    const data = JSON.parse(cache).filter((e)=>{
      return e.jobID == req.params.jobID
    })
    res.json(data[0])
  })
})

app.listen(3000, ()=>{
  console.log('listening on port 3000')
})