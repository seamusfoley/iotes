import {
    DeviceFactory,
    HostFactory,
    DeviceConfig,
    HostConfig,
    DeviceDispatchable,
    HostDispatchable,
    HostConnectionType,
    Strategy,
    Store,
} from '../../types'
import { EnvironmentObject } from '../../environment'
import { createStore } from '../../store'


const createHostDispatchable = (name: string, type: HostConnectionType): HostDispatchable => ({
    [name]: {
        type,
        meta: { timestamp: Date.now().toString(), channel: 'local', host: name },
        payload: {},
    },
})

const createDeviceFactory = (
    hostConfig: HostConfig,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    deviceSubscribe: any,
    store: Store,
): DeviceFactory => {
    const createDeviceDispatchable = (
        type: string,
        deviceName: string,
        payload: {[key: string] : any},
    ):DeviceDispatchable => ({
        [deviceName]: {
            type,
            name: deviceName,
            meta: { timestamp: Date.now().toString(), channel: 'local', host: hostConfig.name },
            payload,
        },
    })

    // RFID READER
    const createRfidReader = async (
        device: DeviceConfig,
    ) => {
        const { name, type } = device

        deviceSubscribe((state: any) => {
            if (state.name === name && state['@@source'] === 'app') {
                store.dispatch(createDeviceDispatchable(
                    type,
                    name,
                    { signal: state.payload.signal },
                ))
            }
        })

        setTimeout(() => {
            deviceDispatch(
                createDeviceDispatchable(type, name, { value: Date.now() }),
            )
        }, 100)

        return device
    }

    // ROTARY ENCODER
    const createRotaryEncoder = async (
        device: DeviceConfig,
    ) => {
        const { type, name } = device

        // resigster trasmitter

        deviceSubscribe((state: any) => {
            if (state.name === name && state['@@source'] === 'app') {
                console.log(`Transmit Thing ${name}`)
            }
        })


        // Register listeners

        setTimeout(() => {
            deviceDispatch(
                createDeviceDispatchable(type, name, { value: Date.now() }),
            )
        }, 100)

        return device
    }

    return {
        ROTARY_ENCODER: createRotaryEncoder,
        RFID_READER: createRfidReader,
    }
}

export const createLocalStoreAndStrategy = ():[Store, Strategy] => {
    const store$ = createStore()

    return [store$, (
        hostDispatch: (dispatchable: HostDispatchable) => void,
        deviceDispatch: (dispatchable: DeviceDispatchable) => void,
        deviceSubscribe: any,
    ): HostFactory => async (
        hostConfig: HostConfig,
    ): Promise<DeviceFactory> => {
        const { logger } = EnvironmentObject

        const { name } = hostConfig

        // Test system dispatch
        setTimeout(() => {
            hostDispatch(createHostDispatchable(hostConfig.name, 'CONNECT'))
        }, 10)

        return createDeviceFactory(hostConfig, deviceDispatch, deviceSubscribe, store$)
    }]
}
