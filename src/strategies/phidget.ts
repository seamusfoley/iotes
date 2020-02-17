import phidget22 from '@wethecurious/phidget22-bundle'
import {
    DeviceFactory,
    HostFactory,
    DeviceConfig,
    HostConfig,
    DeviceDispatchable,
    HostDispatchable,
    HostConnectionType,
} from '../types'
import { RfidReader, RotaryEncoder } from './types'

const createDeviceFactory = (
    hostConfig: HostConfig,
    host: any,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
): DeviceFactory => {
    const createDeviceDispatchable = (
        type: string,
        deviceName: string,
        channel: string,
        payload: {[key: string] : any},
    ):DeviceDispatchable => ({
        [deviceName]: {
            type,
            meta: { timestamp: Date.now().toString(), channel, host: hostConfig.name },
            payload,
        },
    })

    // RFID READER
    const createRfidReader = async (
        device: DeviceConfig,
    ): Promise<DeviceConfig> => {
        const { name, channel, type } = device

        const phidgetChannel = await new host.RFID().open()

        phidgetChannel.onTag((tag: RfidReader.Tag, protocol: RfidReader.Protocol) => {
            deviceDispatch(
                createDeviceDispatchable(type, name, `${channel}`, { tag, protocol }),
            )
        })

        phidgetChannel.onLostTag((tag: RfidReader.Tag, protocol: RfidReader.Protocol) => {
            deviceDispatch(
                createDeviceDispatchable(type, name, `${channel}`, { tag, protocol }),
            )
        })

        return device
    }

    // ROTARY ENCODER
    const createRotaryEncoder = async (
        device: DeviceConfig,
    ): Promise<DeviceConfig> => {
        const { name, channel, type } = device

        const phidgetChannel = await new host.RFID().open()

        phidgetChannel.onPositionChange((
            positionDelta: number,
            timeDelta: number,
            isIndexTriggered: boolean,
        ) => {
            deviceDispatch(
                createDeviceDispatchable(type, name, `${channel}`, { positionDelta, timeDelta, isIndexTriggered }),
            )
        })

        return device
    }

    return {
        RFID_READER: createRfidReader,
        ROTARY_ENCODER: createRotaryEncoder,
    }
}

export const createMqttStrategy = async (
    hostConfig: HostConfig,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    hostDispatch: (dispatchable: HostDispatchable) => void,
):Promise<HostFactory> => async (): Promise<DeviceFactory> => {
    const { name } = hostConfig
    const hostPath = `http://${hostConfig.host}:${hostConfig.port}`

    const createHostDispatchable = (type: HostConnectionType): HostDispatchable => ({
        [name]: {
            type,
            meta: { timestamp: Date.now().toString(), channel: hostPath, host: name },
            payload: {},
        },
    })

    await new phidget22.Connection({
        ...hostConfig,
        onAuthenticationNeeded: () => ({
            ...createHostDispatchable('CONNECT'),
            isError: true,
            Error: { message: 'Authentiction Needed' },
        }),
        onConnect: () => hostDispatch(createHostDispatchable('CONNECT')),
        onDisconnect: () => hostDispatch(createHostDispatchable('DISCONNECT')),
        onError: (code: string, message: string) => ({
            ...createHostDispatchable('CONNECT'),
            isError: true,
            Error: { message, code },
        }),
    })

    return createDeviceFactory(hostConfig, phidget22, deviceDispatch)
}
