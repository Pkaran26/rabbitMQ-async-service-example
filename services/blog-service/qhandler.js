const RabbitMQ = require('./class/rabbitmq')
const service = require('./services/blog')

const filterService = async (content) =>{
  try {
    return await service[content.params.api_name](content)
  } catch (error) {
    return {
      status: false,
      message: 'function not found'
    }
  }
}

const qhandler = async (queue)=>{
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
    process.exit(0)
  }
}

module.exports = qhandler
