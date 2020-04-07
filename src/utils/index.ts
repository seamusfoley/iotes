import { DeviceDispatchable, HostDispatchable, HostConnectionType } from '../types'

export const createDeviceDispatchable = <Types extends string = string, Payload = any>(
    name: string,
    type: Types,
    payload = {},
): DeviceDispatchable<Payload> => ({
        [name]: {
            type,
            name,
            meta: {
                timestamp: Date.now().toString(),
                host: '',
            },
            payload,
        },
    })

export const createHostDispatchable = <Payload = any>(
    name: string,
    type: HostConnectionType,
    payload = {},
): HostDispatchable<Payload> => ({
        [name]: {
            type,
            name,
            meta: {},
            payload,
        },
    })
