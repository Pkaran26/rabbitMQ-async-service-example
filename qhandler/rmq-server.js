const RabbitMQ = require('./class/rabbitmq')

const handleService = async (rabbitMQ, data, serviceQueue)=>{
  const childRabbitMQ = new RabbitMQ()
  await childRabbitMQ.createChannel()
  
  const q = await childRabbitMQ.createClientQueue()
  const correlationId = childRabbitMQ.generateUuid()
  childRabbitMQ.sendToServer(JSON.stringify(data.content), serviceQueue, q, correlationId)

  childRabbitMQ.consumeByClient(q.queue, correlationId, (reply)=>{
    const payload = {
      jobID: data.correlationId,
      data: JSON.parse(reply.content)
    }
    rabbitMQ.addToCache(data.correlationId, payload)
    rabbitMQ.sendToClient(JSON.stringify(payload), data.replyTo, data.correlationId)

    setTimeout(function() {
      childRabbitMQ.connection.close()
    }, 500)
  })
}

const rmqServer = async ()=>{
  const taskQueue = 'requestQueue'
  const serviceQueues = ['blogQueue', 'productQueue']
  try {
    const rabbitMQ = new RabbitMQ()
    await rabbitMQ.createChannel()
    await rabbitMQ.createServerQueue(taskQueue)

    rabbitMQ.consumeByServer(taskQueue, async (data)=>{
      const {serviceType, payload} = JSON.parse(data.content)
      if (serviceQueues.includes(serviceType+'Queue')) {
        await handleService(rabbitMQ, {...data, content: payload}, serviceType+'Queue')
      } else {
        rabbitMQ.sendToClient(JSON.stringify({success: false, message: "service does not matched"}), data.replyTo, data.correlationId)
      }
    })
  } catch (error) {
    console.log('channel not created') 
  }
}

module.exports = rmqServer