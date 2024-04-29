const kafka = require('node-rdkafka')
const {kafkaProducer} = require('../helper')

;(async () => {
    const producer = await kafkaProducer()

    producer.produce('topic-1', null, Buffer.from('hello world4'))
    producer.flush(5000)

    process.exit(0)
})()
