/* eslint-disable no-unused-vars */
import phidget22 from '@wethecurious/phidget22-bundle'
import { DeviceDefinition, IntergrationDefinition, IntergrationClientOptions } from '../types'
import { RfidReader, RotaryEncoder } from './deviceTypes'
import { createDispatcher } from '../utils'
/* eslint-enable no-unused-vars */

export const createPhidgetClient = async (
    intergrationClientOptions: IntergrationClientOptions,
    systemDispatch: any,
) => {
    // eslint-disable-next-line no-new
    await new phidget22.Connection({
        ...intergrationClientOptions,
        onAuthenticationNeeded: () => systemDispatch({
            name: intergrationClientOptions.name,
            isError: true,
            Error: { message: 'Authentiction Needed' },
        }),
        onConnect: () => systemDispatch({
            type: 'CONNECT',
        }),
        onDisconnect: () => systemDispatch({
            type: 'DISCONNECT',
        }),
        onError: (code: string, message: string) => ({
            name: intergrationClientOptions.name,
            isError: true,
            Error: { message, code },
        }),
    })

    return phidget22
}

export const createPhidgetIntergrationDefinition = async (
    client: any,
): Promise<IntergrationDefinition> => {
    const createRfidReader = async (
        deviceDefinition: DeviceDefinition,
    ): Promise<RfidReader.Device> => {
        const { dispatch, name } = deviceDefinition

        const type = 'RFID_READER'
        const dispatcher = createDispatcher(name, type, dispatch)

        const phidgetChannel = await new client.RFID().open()

        phidgetChannel.onTag((tag: RfidReader.Tag, protocol: RfidReader.Protocol) => {
            dispatcher({ tag, protocol })
        })

        phidgetChannel.onLostTag((tag: RfidReader.Tag, protocol: RfidReader.Protocol) => {
            dispatcher({ tag, protocol })
        })

        return {
            type,
            name,
        }
    }

    // ROTARY ENCODER
    const createRotaryEncoder = async (
        deviceDefinition: DeviceDefinition,
    ): Promise<RotaryEncoder.Device> => {
        const { dispatch, name } = deviceDefinition

        const type = 'ROTARY_ENCODER'
        const dispatcher = createDispatcher(name, type, dispatch)

        const phidgetChannel = await new client.RFID().open()

        phidgetChannel.onPositionChange((
            positionDelta: number,
            timeDelta: number,
            isIndexTriggered: boolean,
        ) => {
            dispatcher({ positionDelta, timeDelta, isIndexTriggered })
        })

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
