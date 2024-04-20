const amqp = require('amqplib')
const {RABBIT_URI} = require('../constants')
const {msgParser} = require('../helpers')
const Bluebird = require('bluebird')

const connection = async () => {
    return await amqp.connect(RABBIT_URI)
}

const run = async () => {
    const con = await connection()

    const channel = await con.createChannel()
    const exchange = await channel.assertExchange('tuan-test-direct', 'direct', {
        durable: true,
        autoDelete: false
    })

    const q = await channel.assertQueue('tuan-test-direct-q', {
        durable: true
    })
    const q2 = await channel.assertQueue('tuan-test-direct-q-2', {
        durable: true
        // argumentshttps://www.vmware.com/products/rabbitmq.html : {
        //     'x-dead-letter-exchange': 'test-dead-letter',
        //     /** Using queue name for routing key by default **/
        //     'x-dead-letter-routing-key': 'queue-name-routing-deadletter'
        //     // 'x-message-ttl': 1000 * 30
        // }
    })

}

run()
    .then(async () => {
        await Bluebird.delay(5000)

        process.exit(0)
    })
    .catch((e) => console.log(e))
