/* eslint-disable */
import { createTestMqttBroker } from './testUtils'
import { } from '../src'
/* eslint-enable */

const config: Config = {
    brokerPath: 'mqtt://localhost:1883',
    options: {},
    app: 'test',
    appInstance: 0,
    serviceInstance: 0,
    serialport: '/dev/cu.usbserial-AC00LHNI',
}

const logger: Logger = {
    /* eslint-disable */
    log: (log) => {},
    warn: (log) => {},
    error: (log) => {},
    info: (log) => {},
    /* eslint-enable */
}

const createMqttMock = () => {
    let messages = []

    const dispatch = (message: string) => {
        messages = [message, ...messages]
    }

    return {
        dispatch,
        messages,
    }
}


let testBroker: any
let mqttMock: any
beforeAll(async () => {
    testBroker = await createTestMqttBroker()
    mqttMock = createMqttMock()
})

afterAll(() => testBroker.stop())

describe('mqtt-dmx-bridge ', () => {
    const mqttDmxBridge = createMqttDmxBridge(config, logger, mqttMock)

    test('starts with correct config', () => {
        expect(mqttDmxBridge).toHaveProperty('addProgram')
        expect(mqttDmxBridge).toHaveProperty('setDispatchStrategy')
    })

    test('starts with incorrect config', () => {
        // @ts-ignore
        expect(() => createMqttDmxBridge({}, logger)).toThrowError()
        // @ts-ignore
        expect(() => createMqttDmxBridge({ brokerPath: '' }, logger)).toThrowError()
        // @ts-ignore
        expect(() => createMqttDmxBridge({ brokerPath: '', options: {} }, logger)).toThrowError()
        // @ts-ignore
        expect(() => createMqttDmxBridge({ brokerPath: '', options: {}, app: '' }, logger)).toThrowError()
    })

    test('can add program', () => {
        expect(
            mqttDmxBridge
                .addProgram('THING')
                .add({
                    1: 255, 6: 110, 7: 255, 8: 10,
                }, 1200)
                .delay(1000)
                .add({ 1: 0 }, 600)
                .add({ 1: 255 }, 600)
                .add({ 5: 255, 6: 128 }, 1000)
                .add({ 1: 0 }, 100),
        ).toBeTruthy()
    })

    test('can add program', () => {
        expect(
            mqttDmxBridge
                .addProgram('THING')
                .add({
                    1: 255, 6: 110, 7: 255, 8: 10,
                }, 1200)
                .delay(1000)
                .add({ 1: 0 }, 600)
                .add({ 1: 255 }, 600)
                .add({ 5: 255, 6: 128 }, 1000)
                .add({ 1: 0 }, 100),
        ).toBeTruthy()
    })

    
})
