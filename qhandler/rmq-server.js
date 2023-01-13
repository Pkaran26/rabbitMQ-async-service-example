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

const apiMap = {
  type: 'sync',
  callMap: {
    1: {
      name: 'blog_posts',
      next:[2]
    },
    2: {
      name: 'blog_users',
      next:[3]
    },
    3: {
      name: 'product_products',
      next:[]
    }
  }
}

const runApiMap = (rabbitMQ, data, )=>{
  const {serviceType, payload} = JSON.parse(data.content)
  return new Promise( async(resolve, reject)=>{
    let index = 1
    let final = {}
    while (true) {
    const res = apiMap.callMap[index].name.split('_')
    
    console.log(index,": ", res[0], res[1]);
  
    const result = await handleService(rabbitMQ, {
      ...data, 
      content: {
        ...payload,
        params: {
          ...payload.params,
          api_name: res[1]
        }
      }
    }, res[0]+'Queue')

    final[res[1]] = result
  
    if (apiMap.callMap[index].next.length > 0) {
      index = apiMap.callMap[index].next[0]
    } else {
      resolve(final)
      break
    }
    }
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
      if (apiMap.callMap) {
        let final = await runApiMap(rabbitMQ, data)
        rabbitMQ.sendToClient(JSON.stringify(final), data.replyTo, data.correlationId)
      } else {
        rabbitMQ.sendToClient(JSON.stringify({success: false, message: "service does not matched"}), data.replyTo, data.correlationId)
      }
    })
  } catch (error) {
    console.log('channel not created') 
  }
}

module.exports = rmqServer