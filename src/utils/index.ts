import {
    DeviceDispatchable, HostDispatchable,
    CreateDeviceDispatchable, CreateHostDispatchable,
} from '../types'

export const createDeviceDispatchable: CreateDeviceDispatchable = (
    name, type, payload, meta = {}, source, error,
) => ({
    [name]: {
        type,
        name,
        source,
        payload,
        meta,
        error: error || null,
    },
})

export const createHostDispatchable: CreateHostDispatchable = (
    name, type, payload, meta = {}, source, error,
) => ({
    [name]: {
        type,
        name,
        source,
        payload,
        meta,
        error: error || null,
    },
})

export const insertMetadata = <Payload extends { [key: string]: any }>(
    dispatchable: HostDispatchable | DeviceDispatchable<Payload>,
    meta: {[key: string]: string | number},
) => (
        Object.keys(dispatchable).reduce((a, key) => ({
            ...a,
            [key]: { ...dispatchable[key], ...meta },
        }), {})
    )
