const kafka = require('node-rdkafka')
const {KAFKA_BROKER_LIST} = require('./constants')

/**
 * @returns {kafka.Producer} producer
 */
const kafkaProducer = async () => {
    const producer = new kafka.Producer({
        'metadata.broker.list': KAFKA_BROKER_LIST,
        'client.id': 'kafka_client_id_1',
        'compression.codec': 'gzip',
        'retry.backoff.ms': 200,
        'message.send.max.retries': 10,
        'socket.keepalive.enable': true,
        'queue.buffering.max.messages': 100000,
        'queue.buffering.max.ms': 1000,
        'batch.num.messages': 1000000,
        dr_cb: true
    })

    producer.on('connection.failure', (error, _clientMetrics) => {
        console.log('Connect failed', error)
        // console.log('❤❤❤ tuannm: [simple-pubsub.js][11][error]', error)
        // console.log('❤❤❤ tuannm: [simple-pubsub.js][11][clientMetrics]', clientMetrics)
    })

    // Any errors we encounter, including connection errors
    producer.on('event.error', (err) => {
        console.error('Error from producer', err)
    })

    producer.on('ready', (info, _metadata) => {
        console.log(`ready info=${JSON.stringify(info)}`)
    })

    // We must either call .poll() manually after sending messages
    // or set the producer to poll on an interval (.setPollInterval).
    // Without this, we do not get delivery events and the queue
    // will eventually fill up.
    producer.setPollInterval(100)

    return new Promise((resolve, reject) =>
        producer.connect({}, (e, _data) => {
            if (e) reject(e)
            resolve()
        })
    )
        .then(() => {
            return producer
        })
        .catch((err) => console.error(err))
}

const kafkaConsumer = async () => {}

const kafkaAdmin = async () => {}

const kafkaStream = async () => {}

module.exports = {
    kafkaStream,
    kafkaProducer,
    kafkaConsumer,
    kafkaAdmin
}
