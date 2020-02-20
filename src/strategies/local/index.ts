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

const createDeviceFactory = (
    hostConfig: HostConfig,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    subscribe: Store['subscribe'],
): DeviceFactory => {
    const createDeviceDispatchable = (
        type: string,
        deviceName: string,
        payload: {[key: string] : any},
    ):DeviceDispatchable => ({
        [deviceName]: {
            type,
            meta: { timestamp: Date.now().toString(), channel: 'local', host: hostConfig.name },
            payload,
        },
    })

    // RFID READER
    const createRfidReader = async (
        device: DeviceConfig,
    ) => {
        const { name, type } = device

        let prevValue:any

        deviceDispatch(
            createDeviceDispatchable(type, name, { value: Date.now() }),
        )

        return device
    }

    // ROTARY ENCODER
    const createRotaryEncoder = async (
        device: DeviceConfig,
    ) => {
        const { type, name } = device

        // Register listeners

        deviceDispatch(
            createDeviceDispatchable(type, name, { value: Date.now() }),
        )

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

        const createHostDispatchable = (type: HostConnectionType): HostDispatchable => ({
            [name]: {
                type,
                meta: { timestamp: Date.now().toString(), channel: 'local', host: name },
                payload: {},
            },
        })

        logger.log('CONNECT')

        await new Promise((res: any, _: any) => {
            setTimeout(() => {
                hostDispatch(createHostDispatchable('CONNECT'))
                res()
            }, 100)
        })

        return createDeviceFactory(hostConfig, deviceDispatch, store$.subscribe)
    }]
}
