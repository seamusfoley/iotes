import {
    DeviceDispatchable, HostDispatchable, HostConnectionType,
    CreateDeviceDispatchable, CreateHostDispatchable,
} from '../types'

export const createDeviceDispatchable: CreateDeviceDispatchable = <
Types extends string = string, Payload = any
>(
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

export const createHostDispatchable: CreateHostDispatchable = <Payload = any>(
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
