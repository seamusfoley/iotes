/* eslint-disable no-unused-vars */
import mqtt, { MqttClient } from 'mqtt'
import { DeviceDefinition, IntergrationDefinition, IntergrationClientOptions } from '../types'
import { RfidReader, RotaryEncoder } from './deviceTypes'
/* eslint-enable no-unused-vars */

export const createMqttClient = async (
    intergrationClientOptions: IntergrationClientOptions,
    systemDispatch: any,
    dispatch: any,
) => {
    const { name, host, port } = intergrationClientOptions
    const client = mqtt.connect(`mqtt://${host}:${port}`)

    client.on('connected', () => {
        systemDispatch(
            { type: 'CONNECT', payload: { ...intergrationClientOptions } },
        )
    })


    client.on('reconnected', () => {
        systemDispatch(
            { type: 'CONNECT', payload: { ...intergrationClientOptions } },
        )
    })

    client.on('reconnecting', () => {
        systemDispatch(
            { type: 'RECONNECTING', payload: { ...intergrationClientOptions } },
        )
    })

    client.on('disconnect', () => {
        systemDispatch(
            { type: 'DISCONNECT', payload: { ...intergrationClientOptions } },
        )
    })

    client.on('reconnecting', () => {
        systemDispatch(
            { type: 'RECONNECT', payload: { ...intergrationClientOptions } },
        )
    })

    client.on('message', (topic: string, message: string) => {
        const topics = topic.split('/')
        dispatch({ topic, message })
    })
}

export const createMqttIntergrationDefinition = async (
    client: MqttClient,
): Promise<IntergrationDefinition> => {
    // RFID READER

    const createRfidReader = async (
        deviceDefinition: DeviceDefinition,
    ): Promise<RfidReader.Device> => {
        const { name, channel } = deviceDefinition

        const type = 'RFID_READER'

        // Register listeners
        client.subscribe(`mqttmock/${channel}/onTag`)
        client.subscribe(`mqttmock/${channel}/onLostTag`)

        return {
            type,
            name,
        }
    }

    // ROTARY ENCODER

    const createRotaryEncoder = async (
        deviceDefinition: DeviceDefinition,
    ): Promise<RotaryEncoder.Device> => {
        const { name, channel } = deviceDefinition

        const type = 'ROTARY_ENCODER'

        // Register listeners
        client.subscribe(`mqttmock/${channel}/onPositionChange`)

        return {
            type,
            name,
        }
    }

    return {
        RFID_READER: createRfidReader,
        ROTARY_ENCODER: createRotaryEncoder,
    }
}
