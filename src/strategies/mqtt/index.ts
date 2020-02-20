import mqtt, { MqttClient } from 'mqtt'
import {
    DeviceFactory,
    HostFactory,
    DeviceConfig,
    HostConfig,
    DeviceDispatchable,
    HostDispatchable,
    HostConnectionType,
    Strategy,
} from '../../types'
import { EnvironmentObject } from '../../environment'

const createDeviceFactory = (
    hostConfig: HostConfig,
    host: MqttClient,
): DeviceFactory => {
    // RFID READER
    const createRfidReader = async (
        device: DeviceConfig,
    ) => {
        const { name } = device

        // Register listeners
        host.subscribe(`${hostConfig.name}/phidget/${name}/onTag`)
        host.subscribe(`${hostConfig.name}/phidget/${name}/onLostTag`)

        return device
    }

    // ROTARY ENCODER
    const createRotaryEncoder = async (
        device: DeviceConfig,
    ) => {
        const { type, name, channel } = device

        // Register listeners
        host.subscribe(`${hostConfig.name}/phidget/${name}/onPositionChange`)

        return device
    }

    return {
        ROTARY_ENCODER: createRotaryEncoder,
        RFID_READER: createRfidReader,
    }
}

export const createMqttStrategy: Strategy = (
    hostDispatch: (dispatchable: HostDispatchable) => void,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
): HostFactory => async (
    hostConfig: HostConfig,
): Promise<DeviceFactory> => {
    const { logger } = EnvironmentObject

    const { name } = hostConfig
    const hostPath = `ws://${hostConfig.host}:${hostConfig.port}`

    const connect = async (): Promise<MqttClient> => (
        new Promise((res, reject) => {
            try {
                res(mqtt.connect(hostPath))
            } catch (error) {
                reject(Error(error))
            }
        })
    )

    const host = await connect()

    logger.info(`mqtt host config: ${JSON.stringify(host.options, null, 2)}`)

    const createHostDispatchable = (type: HostConnectionType): HostDispatchable => ({
        [name]: {
            type,
            meta: { timestamp: Date.now().toString(), channel: hostPath, host: name },
            payload: {},
        },
    })

    const createDeviceDispatchable = (
        type: string,
        deviceName: string,
        payload: {[key: string] : any},
    ):DeviceDispatchable => ({
        [deviceName]: {
            type,
            meta: { timestamp: Date.now().toString(), channel: 'mqtt', host: name },
            payload,
        },
    })

    host.on('connect', () => {
        hostDispatch(createHostDispatchable('CONNECT'))
    })

    host.on('reconnect', () => {
        hostDispatch(createHostDispatchable('CONNECT'))
    })

    host.on('reconnecting', () => {
        hostDispatch(createHostDispatchable('RECONNECTING'))
    })

    host.on('disconnect', () => {
        hostDispatch(createHostDispatchable('DISCONNECT'))
    })

    host.on('subscribe', () => {
        hostDispatch(createHostDispatchable('CONNECT'))
    })

    host.on('message', (topic: string, message: string) => {
        const topics = topic.split('/')
        const [deviceName, type] = topics.slice(-2)

        deviceDispatch(createDeviceDispatchable(deviceName, type, JSON.parse(message)))
    })

    return createDeviceFactory(hostConfig, host)
}
