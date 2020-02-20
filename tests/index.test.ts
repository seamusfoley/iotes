import { createTestMqttBroker, createTestClient } from './testUtils'
import { TopologyMap, Store, DeviceDispatchable } from '../src/types'
import { createMqttStrategy } from '../src/strategies/mqtt'
import { createPhidgetReact } from '../src'
import { createLocalStoreAndStrategy } from '../src/strategies/local'
import { createStore } from '../src/store'

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

const createDeviceDispatchable = (
    type: string,
    deviceName: string,
    payload: {[key: string] : any},
):DeviceDispatchable => ({
    [deviceName]: {
        type,
        meta: { timestamp: '1234', channel: 'local', host: 'local' },
        payload,
    },
})


// @ts-ignore
let phidgetReact
// @ts-ignore
let testClient
// @ts-ignore
let testBroker
let createLocalStrategy
let localStore: Store

beforeAll(async () => {
    // testBroker = await createTestMqttBroker()
    // testClient = await createTestClient();
    // [localStore, createLocalStrategy] = createLocalStoreAndStrategy()
})

afterAll(() => {
    localStore = null
    // testBroker.stop()
})

describe('Store module ', () => {
    beforeEach(() => {
        localStore = createStore()
    })

    afterEach(() => {
        localStore = null
    })

    test('Can create Store ', () => {
        expect(() => {
            createStore()
        }).not.toThrowError()
        expect(localStore).toHaveProperty('subscribe')
        expect(localStore).toHaveProperty('dispatch')
    })

    test('Can subscribe ', () => {
        expect(() => localStore.subscribe((state) => state)).not.toThrowError()
    })

    test('Can dispatch ', () => {
        let result: any = null
        localStore.subscribe((state) => { result = state })
        localStore.dispatch({ payload: 'test' })
        expect(result.payload).toBe('test')
    })

    test('Handles malformed dispatch ', () => {
        let result: any = null
        localStore.subscribe((state) => { result = state })
        // @ts-ignore
        localStore.dispatch('what')
        // @ts-ignore
        localStore.dispatch(['thing', 'thing'])
        // @ts-ignore
        localStore.dispatch(1)
        // @ts-ignore
        localStore.dispatch({ payload: 'test' })
        // @ts-ignore
        localStore.dispatch('what')
        // @ts-ignore
        localStore.dispatch(['thing', 'thing'])
        // @ts-ignore
        localStore.dispatch(1)

        expect(result).toStrictEqual({ payload: 'test' })
    })

    test('Handles multiple devices correctly', () => {
        let result: any = null
        localStore.subscribe((state) => { result = state })

        localStore.dispatch(createDeviceDispatchable('RFID_READER', 'reader/1', { sample: 'test' }))
        localStore.dispatch(createDeviceDispatchable('RFID_READER', 'reader/2', { sample: 'test' }))
        localStore.dispatch(createDeviceDispatchable('RFID_READER', 'reader/1', { sample: 'newTest' }))

        expect(result).toStrictEqual({
            /* eslint-disable */
            'reader/1': {
                type: 'RFID_READER',
                meta: { timestamp: '1234', channel: 'local', host: 'local' },
                payload: { sample: 'newTest' }
            },
            'reader/2': {
                type: 'RFID_READER',
                meta: { timestamp: '1234', channel: 'local', host: 'local' },
                payload: { sample: 'test' }
            }
            /* eslint-enable */
        })
    })
})

let localModule: any

describe('Strategy implementation ', () => {
    beforeEach(async () => {
        [localStore, createLocalStrategy] = createLocalStoreAndStrategy()
        localModule = await createPhidgetReact(testTopologoy, createLocalStrategy)
            .catch((err) => { throw Error(err) })
    })

    afterEach(() => {
        localModule = null
    })

    test('Can create intergration', () => {
        expect(async () => {
            localModule = await createPhidgetReact(testTopologoy, createLocalStrategy)
                .catch((err) => { throw Error(err) })
        }).not.toThrowError()
        expect(localModule).toHaveProperty('systemSubscribe')
        expect(localModule).toHaveProperty('deviceSubscribe')
    })

    test('Intergration dispatches correctly', () => {
        let result: any
        localModule.systemSubscribe((state) => { result = state })

        console.log(result)
    })
})
