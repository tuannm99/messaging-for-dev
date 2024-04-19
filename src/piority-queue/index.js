const amqp = require('amqplib')
const {RABBIT_URI} = require('../constants')

const connection = async () => {
    return await amqp.connect(RABBIT_URI)
}

const pub = async () => {
    const con = await connection()

    const channel = await con.createChannel()
    const exchange = await channel.assertExchange('tuan-test-direct', 'direct', {
        durable: true,
        autoDelete: false
    })

    const q = await channel.assertQueue('tuan-test-direct-q', {
        durable: true
    })
    const q2 = await channel.assertQueue('tuan-test-direct-q', {
        durable: true
    })

    channel.bindQueue(q.queue, 'tuan-test-direct-q-routing-key')
    channel.bindQueue(q2.queue, 'tuan-test-direct-q-routing-key-2')

    channel.consume(
        q.queue,
        (msg) => {
            // msg.fields.routingKey
            // msg.properties
            console.log(msg.content.toString())
        },
        {noAck: true}
    )
    channel.consume(
        q2.queue,
        (msg) => {
            // msg.fields.routingKey
            // msg.properties
            console.log(msg.content.toString())
        },
        {noAck: true}
    )

    channel.publish(exchange, 'tuan-test-direct-q-routing-key', Buffer.from({msg: 'hello'}))
    channel.publish(exchange, 'tuan-test-direct-q-routing-key-2', Buffer.from({msg: 'hello2'}))
}
