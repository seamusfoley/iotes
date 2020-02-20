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
    hostDispatch: (dispatchable: DeviceDispatchable) => void,
    subscribe: Store['subscribe'],
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

    setTimeout(() => {
        hostDispatch(createHostDispatchable(hostConfig.name, 'CONNECT'))
    }, 10)


    // RFID READER
    const createRfidReader = async (
        device: DeviceConfig,
    ) => {
        const { name, type } = device

        let prevValue:any

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
    ): HostFactory => async (
        hostConfig: HostConfig,
    ): Promise<DeviceFactory> => {
        const { logger } = EnvironmentObject

        const { name } = hostConfig

        return createDeviceFactory(hostConfig, deviceDispatch, hostDispatch, store$.subscribe)
    }]
}
