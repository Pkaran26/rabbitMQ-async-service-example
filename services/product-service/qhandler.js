const RabbitMQ = require('./class/rabbitmq')
const { getProducts } = require('./services/product')

const filterService = async (content) =>{
  if (content.params.api_name == 'products') {
    return await getProducts(content)
  } else {
    return {
      status: false,
      message: 'product path not found'
    }
  }
}

const productManager = async ()=>{
  const queue = 'product'
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

module.exports = productManager
