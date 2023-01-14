const express = require('express')
const cors = require('cors')
const qhandler = require('./qhandler')
const app = express()

app.use(express.json())
app.use(cors())
qhandler('productQueue')

app.listen(8001, ()=>{
  console.log('listening on port 8001')
})