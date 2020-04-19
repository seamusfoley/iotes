import {
    DeviceDispatchable, HostDispatchable, HostConnectionType,
    CreateDeviceDispatchable, CreateHostDispatchable, ErrorDispatchable,
    LoopbackGuard,
} from '../types'

export const createDeviceDispatchable: CreateDeviceDispatchable = (
    name, type, payload, source, meta, error,
) => ({
    [name]: {
        type,
        name,
        payload,
        meta,
        '@@source': source,
        error: error || null,
    },
})

export const createHostDispatchable: CreateHostDispatchable = (
    name, type, payload, source, meta, error,
) => ({
    [name]: {
        type,
        name,
        payload,
        meta,
        error: error || null,
        '@@source': source,
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

export const loopbackGuard: LoopbackGuard = (
    deviceName,
    state,
    dispatchable,
) => (state[deviceName]?.['@@source'] !== dispatchable[deviceName]?.['@@source'] || true)
