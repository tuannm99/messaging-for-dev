const kafka = require('node-rdkafka')
const {KAFKA_BROKER_LIST} = require('./constants')

/**
 * @returns {Promise<kafka.Producer>} producer
 */
const kafkaProducer = async () => {
    const producer = new kafka.Producer({
        'metadata.broker.list': KAFKA_BROKER_LIST,
        // 'allow.auto.create.topics': true,
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

    producer.on('connection.failure', (error, clientMetrics) => {
        if (error) {
            console.log('Connect failed', error)
            return
        }
        console.log('clientMetrics', clientMetrics)
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

/**
 * @returns {Promise<kafka.KafkaConsumer>} consumer
 */
const kafkaConsumer = async () => {
    const consumer = new kafka.KafkaConsumer(
        {
            'metadata.broker.list': KAFKA_BROKER_LIST,
            'group.id': 'kafka',
            'partition.assignment.strategy': 'roundrobin',
            // 'enable.auto.commit': true
            rebalance_cb: (err, assignment) => {
                if (err) {
                    if (err.code === kafka.CODES.ERRORS.ERR__ASSIGN_PARTITIONS) {
                        console.error('❤❤❤ tuannm: [helper.js][66][err]', err)
                        // TODO: -> reassign
                    } else if (err.code == kafka.CODES.ERRORS.ERR__REVOKE_PARTITIONS) {
                        console.error('❤❤❤ tuannm: [helper.js][69][err]', err)
                        // TODO: -> reassign
                    } else {
                        console.error(err)
                    }
                    return null
                }
                console.log('❤❤❤ tuannm: [helper.js][61][assignment]', assignment)
            },
            offset_commit_cb: (err, topicPartitions) => {
                if (err) {
                    // There was an error committing
                    console.error(err)
                    return
                } else {
                    // Commit went through. Let's log the topic partitions
                    console.log(topicPartitions)
                }
            }
        },
        {}
    )

    consumer.on('connection.failure', (error, _clientMetrics) => {
        console.log('Connect failed', error)
    })

    consumer.on('event.error', (err) => {
        console.error('Error from producer', err)
    })

    consumer.on('ready', (info, _metadata) => {
        console.log(`ready info=${JSON.stringify(info)}`)
    })

    consumer.on('rebalance', (err, assignments) => {
        if (err) {
            console.error(`rebalance error=${JSON.stringify(err)}`)
            return
        }
        console.log(`assignments: ${JSON.stringify(assignments)}`)
    })

    consumer.on('offset.commit', (err, topicPartitions) => {
        if (err) {
            console.error(`offset commit error=${JSON.stringify(err)}`)
            return
        }
        console.log(`topic pattitions: ${JSON.stringify(topicPartitions)}`)
    })

    return new Promise((resolve, reject) =>
        consumer.connect({}, (e, _data) => {
            if (e) reject(e)

            resolve()
        })
    )
        .then(() => {
            return consumer
        })
        .catch((err) => console.error(err))
}

const kafkaAdmin = async () => {}

const kafkaStream = async () => {}

module.exports = {
    kafkaStream,
    kafkaProducer,
    kafkaConsumer,
    kafkaAdmin
}
