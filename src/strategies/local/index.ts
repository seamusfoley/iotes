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
    ClientConfig,
} from '../../types'
import { createStore } from '../../store'

type DeviceTypes = 'RFID_READER' | 'ROTARY_ENCODER'

const createHostDispatchable = (
    type: HostConnectionType,
    name: string,
    payload: { [key: string]: any } = {},
): HostDispatchable => ({
    [name]: {
        type,
        name,
        meta: {
            timestamp: Date.now().toString(),
            channel: 2,
            host: name,
        },
        payload,
    },
})

const createDeviceFactory = async <StrategyConfig> (
    hostConfig: HostConfig<StrategyConfig>,
    client: ClientConfig,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    deviceSubscribe: any,
    store: Store,
): Promise<DeviceFactory<DeviceTypes>> => {
    const createDeviceDispatchable = (
        type: string,
        deviceName: string,
        payload: { [key: string]: any },
    ): DeviceDispatchable => ({
        [deviceName]: {
            type,
            name: deviceName,
            meta: {
                timestamp: Date.now().toString(),
                channel: 2,
                host: hostConfig.name,
            },
            payload,
        },
    })

    // RFID READER
    const createRfidReader = async (device: DeviceConfig<'RFID_READER'>) => {
        const { name, type } = device

        deviceSubscribe((state: any) => {
            if (state[name] && state[name]['@@source'] === client.name) {
                store.dispatch({ [name]: state[name] })
            }
        })

        await setTimeout(() => {
            deviceDispatch(
                createDeviceDispatchable(type, name, { value: Date.now() }),
            )
        }, 10)

        return device
    }

    // ROTARY ENCODER
    const createRotaryEncoder = async (device: DeviceConfig<'ROTARY_ENCODER'>) => {
        const { type, name } = device

        // resigster trasmitter
        deviceSubscribe((state: any) => {
            if (state[name] && state[name]['@@source'] === client.name) {
                store.dispatch({ [name]: state[name] })
            }
        })

        // Register listeners
        await setTimeout(() => {
            deviceDispatch(
                createDeviceDispatchable(type, name, { value: Date.now() }),
            )
        }, 10)

        return device
    }

    return {
        RFID_READER: createRfidReader,
        ROTARY_ENCODER: createRotaryEncoder,
    }
}

export const createLocalStoreAndStrategy = (): [Store, Strategy<undefined, DeviceTypes>] => {
    const store$ = createStore()

    return [
        store$,
        <StrategyConfig>(
            hostDispatch: (dispatchable: HostDispatchable) => void,
            deviceDispatch: (dispatchable: DeviceDispatchable) => void,
            hostSubscribe: any,
            deviceSubscribe: any,
        ): HostFactory<StrategyConfig, DeviceTypes> => async (
            hostConfig: HostConfig<StrategyConfig>,
            clientConfig: ClientConfig,
        ): Promise<DeviceFactory<DeviceTypes>> => {
            const { name } = clientConfig

            hostSubscribe((state: any) => {
                store$.dispatch(
                    createHostDispatchable('CONNECT', hostConfig.name, {
                        signal: 'test',
                    }),
                )
            })

            // Test host dispatch
            await new Promise((res) => {
                setTimeout(() => {
                    hostDispatch(
                        createHostDispatchable('CONNECT', hostConfig.name),
                    )
                    res()
                }, 10)
            })

            return createDeviceFactory(
                hostConfig,
                clientConfig,
                deviceDispatch,
                deviceSubscribe,
                store$,
            )
        },
    ]
}
