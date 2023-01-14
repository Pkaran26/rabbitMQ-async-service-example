const RabbitMQ = require('./class/rabbitmq')

const handleService = async (rabbitMQ, data, serviceQueue)=>{
  const childRabbitMQ = new RabbitMQ()
  await childRabbitMQ.createChannel()
  
  const q = await childRabbitMQ.createClientQueue()
  const correlationId = childRabbitMQ.generateUuid()
  childRabbitMQ.sendToServer(JSON.stringify(data.content), serviceQueue, q, correlationId)

  return new Promise ((resolve, reject) =>{
    childRabbitMQ.consumeByClient(q.queue, correlationId, (reply)=>{
      const payload = {
        jobID: data.correlationId,
        data: JSON.parse(reply.content)
      }
      rabbitMQ.addToCache(data.correlationId, payload)

      setTimeout(function() {
        childRabbitMQ.connection.close()
        resolve(payload)
      }, 500)
    })
  })
}

const rmqServer = async (taskQueue, serviceQueues)=>{
  try {
    const rabbitMQ = new RabbitMQ()
    await rabbitMQ.createChannel()
    await rabbitMQ.createServerQueue(taskQueue)

    rabbitMQ.consumeByServer(taskQueue, async (data)=>{
      const {serviceType, payload} = JSON.parse(data.content)
      if (serviceQueues.includes(serviceType+'Queue')) {
        const result = await handleService(rabbitMQ, {...data, content: payload}, serviceType+'Queue')
        rabbitMQ.sendToClient(JSON.stringify(result), data.replyTo, data.correlationId)

      } else {
        rabbitMQ.sendToClient(JSON.stringify({success: false, message: "service does not matched"}), data.replyTo, data.correlationId)
      }
    })
  } catch (error) {
    console.log('channel not created') 
  }
}

module.exports = rmqServer