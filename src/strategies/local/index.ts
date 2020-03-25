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
            channel: 'local',
            host: name,
        },
        payload,
    },
})

const createDeviceFactory = <StrategyConfig>(
    hostConfig: HostConfig<StrategyConfig>,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    deviceSubscribe: any,
    store: Store,
): DeviceFactory => {
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
                channel: 'local',
                host: hostConfig.name,
            },
            payload,
        },
    })

    // RFID READER
    const createRfidReader = async (device: DeviceConfig) => {
        const { name, type } = device

        deviceSubscribe((state: any) => {
            // console.log(`device subscibe ${JSON.stringify(state, null, 2)}`)
            if (state.name === name && state['@@source'] === 'APP') {
                store.dispatch(
                    createDeviceDispatchable(type, name, {
                        signal: state.payload.signal,
                    }),
                )
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
    const createRotaryEncoder = async (device: DeviceConfig) => {
        const { type, name } = device

        // resigster trasmitter

        deviceSubscribe((state: any) => {
            if (state.name === name && state['@@source'] === 'APP') {
                console.log(`Transmit Thing ${name}`)
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
        ROTARY_ENCODER: createRotaryEncoder,
        RFID_READER: createRfidReader,
    }
}

export const createLocalStoreAndStrategy = (): [Store, Strategy<undefined>] => {
    const store$ = createStore()

    return [
        store$,
        <StrategyConfig>(
            hostDispatch: (dispatchable: HostDispatchable) => void,
            deviceDispatch: (dispatchable: DeviceDispatchable) => void,
            hostSubscribe: any,
            deviceSubscribe: any,
        ): HostFactory<StrategyConfig> => async (
            hostConfig: HostConfig<StrategyConfig>,
        ): Promise<DeviceFactory> => {
            const { logger } = EnvironmentObject

            const { name } = hostConfig

            hostSubscribe((state: any) => {
                if (state.name === name && state['@@source'] === 'APP') {
                    store$.dispatch(
                        createHostDispatchable('CONNECT', hostConfig.name, {
                            signal: 'test',
                        }),
                    )
                }
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
                deviceDispatch,
                deviceSubscribe,
                store$,
            )
        },
    ]
}
