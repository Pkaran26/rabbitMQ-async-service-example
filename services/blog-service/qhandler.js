const RabbitMQ = require('./class/rabbitmq')
const blogService = require('./services/blog')

const filterService = async (content) =>{
  try {
    return await blogService[content.params.api_name](content)
  } catch (error) {
    return {
      status: false,
      message: 'service not found'
    }
  }
}

const qhandler = async ()=>{
  const queue = 'blogQueue'
  try {
    const rabbitMQ = new RabbitMQ()
    await rabbitMQ.createChannel()
    await rabbitMQ.createServerQueue(queue)

    rabbitMQ.consumeByServer(queue, async (data)=>{
      const payload = await filterService(JSON.parse(data.content))
      rabbitMQ.sendToClient(JSON.stringify(payload), data.replyTo, data.correlationId)
    })
  } catch (error) {
    console.log('channel not created', error) 
    callback({
      success: false,
      message: 'server error'
    })
    process.exit(0)
  }
}

module.exports = qhandler
