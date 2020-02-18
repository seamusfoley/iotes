import mqtt from 'mqtt'

export const createTestClient = () => (
    new Promise((resolve, reject) => {
        const client = mqtt.connect('ws://127.0.0.1:8888')

        const publish = (topic: string, message: string) => { client.publish(topic, message) }

        client.on('connect', () => { resolve({ publish }) })
    })
)
