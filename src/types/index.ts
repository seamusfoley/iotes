// Hosts
export type HostMap = HostConfig[]

export type HostConfig = {
    name: string
    host: string
    port: string
    password?: string
}

export type HostConnectionType = 'CONNECT' | 'DISCONNECT' | 'RECONNECTING' | 'DEVICE_CONNECT' | 'DEVICE_DISCONNECT'

export type HostFactory = (hostConfig: HostConfig) => Promise<DeviceFactory>

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

// Integration
export type Integration = (
    hostFactory: HostFactory,
    topologyMap: TopologyMap
) => void

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

export type LogLevel = 'SILENT' | 'INFO' | 'LOG' | 'WARN' | 'DEBUG' | 'ERROR'

// Dispatchables
export type State = { [key: string]: any }

export type Dispatchable = State | Error

export type ErrorDispatchable = {
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
    name: string
    meta: { timestamp: string, channel: string, host: string }
    payload: {[key: string]: any}
} & ErrorDispatchable }

export type Subscription = (state: State) => any

export type Selector = string[]

export type Subscriber = [Subscription, Selector | undefined]

export interface Store {
    dispatch: (dispatchable: Dispatchable) => void
    subscribe: (subscription: Subscription, selector?: Selector) => void
}

// Strategy
export type TopologyMap = { hosts: HostConfig[], devices: DeviceConfig[] }

export type Strategy = (
    hostDispatch: (dispatchable: HostDispatchable) => void,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    hostSubscribe: (subscriber: (state: State) => void) => void,
    deviceSubscribe: (subscriber: (state: State) => void) => void,
) => HostFactory


// Iotes

// This is the return type without plugins

export type Iotes = {
    hostDispatch: (dispatchable: HostDispatchable) => void,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    hostSubscribe: (subscription: Subscription, selector?: Selector) => void,
    deviceSubscribe: (subscription: Subscription, selector?: Selector) => void,
}

export type CreateIotes = (conifg: {
    topology: TopologyMap,
    strategy: Strategy,
    plugin?: (iotes: Iotes) => any,
    logLevel?: LogLevel,
    logger?: Logger,
}) => Iotes

declare const createIotes: CreateIotes

export { createIotes }
