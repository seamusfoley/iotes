// Hosts
export type HostMap = HostConfig[]

export type HostConfig = {
    name: string
    host: string
    port: string
    password?: string
    strategy: string
}

export type HostConnectionType = 'CONNECT' | 'DISCONNECT' | 'RECONNECTING'

export type HostFactory = (hostConfig: HostConfig) => Promise<HostConfig & any>

// Devices
export type DeviceType = 'RFID_READER' | 'ROTARY_ENCODER'

export type DeviceMap = DeviceConfig[]

export type DeviceConfig = {
    type: DeviceType
    name: string,
    channel: number,
    hostName: string
}

export type DeviceFactory = {
    [key in 'RFID_READER' | 'ROTARY_ENCODER']: (device: DeviceConfig) => Promise<{type: DeviceType, name: string, channel: number}>
}

// Intergration
export type IntergrationFactory = (
    config: any,
    deviceDispatch: () => Dispatchable,
    clientDispatch: () => Dispatchable
) => {
    clientFactory: HostFactory,
    deviceFactory: DeviceFactory,
}


export type PhidgetReactConfig = {
    host: string
    password?: string
    mqttHost?: string
    strategy?: string
}

// Logger
export interface Logger {
    log: (log: string) => any
    info: (info: string) => any
    warn: (warning: string) => any
    error: (error: string) => any
}

export type LogLevel = 'SILENT' | 'INFO' | 'LOG' | 'WARN' | 'DEBUG'

// Dispatchables
export type State = { [key: string]: any }

export type Dispatchable = State | Error

type ErrorDispatchable = {
    isError?: boolean,
    error?: { message: string, code?: string, level: LogLevel }
}

export type DeviceDispatchable = {[deviceName: string] : {
    type: string,
    meta: { timestamp: string, channel: string, host: string },
    payload: {[key: string]: any}
} | Error }

export type HostDispatchable = {[deviceName: string] : {
    type: HostConnectionType
    meta: { timestamp: string, channel: string, host: string }
    payload: {[key: string]: any}
} & ErrorDispatchable }

export interface Store {
    dispatch: (dispatchable: Dispatchable) => void
    subscribe: (subscriber: (state: State) => void) => void
}

// Strategy
export type TopologyMap = { hosts: HostConfig[], devices: DeviceConfig[] }

export type Strategy = (
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    hostDispatch: (dispatchable: HostDispatchable) => void,
) => HostFactory
