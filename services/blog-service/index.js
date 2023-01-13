const express = require('express')
const cors = require('cors')
const qhandler = require('./qhandler')
const app = express()

app.use(express.json())
app.use(cors())
qhandler()

app.listen(8000, ()=>{
  console.log('listening on port 8000')
})