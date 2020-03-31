import { TopologyMap, Store, DeviceDispatchable } from '../src/types'
import { createIotes } from '../src'
import { createLocalStoreAndStrategy } from '../src/strategies/local'
import { createStore } from '../src/store'

// Test data

type DeviceTypes = 'RFID_READER' | 'ROTARY_ENCODER'

const testTopologoy: TopologyMap<{}, DeviceTypes> = {
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

// Tests

let createLocalStrategy: any
let localStore: Store

afterAll(() => {
    localStore = null
})

/* Tests store module implementation only */

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

/* Tests full strategy implementation. Uses local strategy as it Integration that uses timeouts to
simulate devices being connected and/or disconnected */

let localModule: any
describe('Strategy implementation ', () => {
    beforeEach(async () => {
        [localStore, createLocalStrategy] = createLocalStoreAndStrategy()
        localModule = createIotes({
            topology: testTopologoy,
            strategy: createLocalStrategy,
        })
    })

    afterEach(() => {
        localModule = null
    })

    test('Can create Integration', () => {
        expect(() => {
            localModule = createIotes({
                topology: testTopologoy,
                strategy: createLocalStrategy,
            })
        }).not.toThrowError()
        expect(localModule).toHaveProperty('hostSubscribe')
        expect(localModule).toHaveProperty('deviceSubscribe')
        expect(localModule).toHaveProperty('hostSubscribe')
        expect(localModule).toHaveProperty('deviceDispatch')
    })

    test('Integrated host dispatches correctly', async () => {
        let result: any = null
        localModule.hostSubscribe((state: any) => { result = state })

        await new Promise((res, rej) => setTimeout(() => {
            if (result) {
                res()
            }
            rej(Error('Result Empty'))
        }, 20))

        expect(result[testTopologoy.hosts[0].name].type).toBe('CONNECT')
    })

    test('Integrated devices dispatch correctly', async () => {
        let result: any = null
        localModule.deviceSubscribe((state: any) => { result = state })

        await new Promise((res, rej) => setTimeout(() => {
            if (result) {
                res()
            }
            rej(Error('Result Empty'))
        }, 100))

        expect(result[testTopologoy.devices[0].name].type).toBe('RFID_READER')
    })

    // TODO fix internal dispatch

    /* test('App dispatched to integrated decives correctly', async () => {
        let result: any = null
        const deviceName = 'READER/1'
        const signal = 'test'
        localStore.subscribe((state) => { result = state })
        localModule.deviceDispatch({ name: deviceName, payload: { signal } })
        await new Promise((res, rej) => setTimeout(() => {
            if (result) {
                res()
            }
            rej(Error('Result Empty'))
        }, 100))

        expect(result[deviceName].payload).toStrictEqual({ signal })
    })

    test('App dispatched to Integration host correctly', async () => {
        let result: any = null
        const hostName = 'testapp/0'
        const signal = 'test'
        localStore.subscribe((state) => { result = state })
        localModule.hostDispatch({ name: hostName, payload: { signal } })
        await new Promise((res, rej) => setTimeout(() => {
            if (result) {
                res()
            }
            rej(Error('Result Empty'))
        }, 500))

        expect(result[hostName].payload).toStrictEqual({ signal })
    }) */
})
