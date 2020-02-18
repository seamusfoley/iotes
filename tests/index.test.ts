import { createTestMqttBroker, createTestClient } from './testUtils'
import { Logger, TopologyMap } from '../src/types'
import { createMqttStrategy } from '../src/strategies/mqtt'
import { createPhidgetReact } from '../src'

const testTopologoy: TopologyMap = {
    hosts: [{ name: 'testapp/0', host: 'localhost', port: '8888' }],
    devices: [
        {
            hostName: 'testapp/0',
            type: 'RFID_READER',
            name: 'READER/1',
            channel: 1,
        },
        {
            hostName: 'testapp/0',
            type: 'ROTARY_ENCODER',
            name: 'ENCODER/1',
            channel: 2,
        },
    ],
}

const logger: Logger = {
    log: (log) => {},
    warn: (log) => {},
    error: (log) => {},
    info: (log) => {},
}


// @ts-ignore
let phidgetReact
// @ts-ignore
let testClient
// @ts-ignore
let testBroker

beforeAll(async () => {
    testBroker = await createTestMqttBroker()
    testClient = await createTestClient()
})

afterAll(() => {
    testBroker.stop()
})

describe('phidget-react ', () => {
    test('expect ', () => { expect(true).toBeTruthy() })

    test('starts with correct config', async () => {
        phidgetReact = await createPhidgetReact(testTopologoy, createMqttStrategy)
        expect(phidgetReact).toHaveProperty('systemSubscribe')
        expect(phidgetReact).toHaveProperty('deviceSubscribe')
    })

    test('accepts subscription call back', () => {
        expect(() => phidgetReact.systemSubscribe((state: any) => console.log(state))).not.toThrowError()
        expect(() => phidgetReact.deviceSubscribe((state: any) => console.log(state))).not.toThrowError()
    })

    test('accepts data from mqtt mock', () => {
        testClient.publish('testapp/0/phidget/READER/1/onTag', JSON.stringify({ type: 'THING', payload: {} }))
    })
})
