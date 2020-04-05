// Hosts
export type HostMap<StrategyConfig> = HostConfig<StrategyConfig | undefined>[]

export type HostConfig<StrategyConfig> = {
    name: string
    host: string
    port: string
    strategyConfig?: StrategyConfig
}

export type HostConnectionType = 'CONNECT' | 'DISCONNECT' | 'RECONNECTING' | 'DEVICE_CONNECT' | 'DEVICE_DISCONNECT'

export type HostFactory<StrategyConfig, DeviceTypes extends string> = (
    hostConfig: HostConfig<StrategyConfig>
) => Promise<DeviceFactory<DeviceTypes>>

// Devices

export type DeviceMap<DeviceTypes> = DeviceConfig<DeviceTypes> []

export type DeviceConfig<DeviceTypes> = {
    type: DeviceTypes
    name: string,
    channel: number,
    hostName: string
}

export type DeviceFactory<DeviceTypes extends string> = {
    [ key in DeviceTypes ]: (
        device: DeviceConfig<DeviceTypes>
    ) => Promise<{
        type: DeviceTypes,
        name: string,
        channel: number
    }>
}

// Integration
export type Integration = <StrategyConfig, DeviceTypes extends string>(
    hostFactory: HostFactory<StrategyConfig, DeviceTypes>,
    topologyMap: TopologyMap<StrategyConfig, DeviceTypes>
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

export type DeviceDispatchable = {[key: string] : {
    name: string,
    type: string,
    meta: { timestamp: string, channel: string, host: string },
    payload: {[key: string]: any}
} | Error }

export type HostDispatchable = { [key: string] : {
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
export type TopologyMap<StrategyConfig, DeviceTypes extends string> = {
    hosts: HostMap<StrategyConfig>,
    devices: DeviceConfig<DeviceTypes>[],
}

export type Strategy<StrategyConfig, DeviceTypes extends string> = (
    hostDispatch: (dispatchable: HostDispatchable) => void,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    hostSubscribe: (subscriber: (state: State) => void) => void,
    deviceSubscribe: (subscriber: (state: State) => void) => void,
) => HostFactory<StrategyConfig, DeviceTypes>


// Iotes

// This is the return type without plugins

export type Iotes = {
    hostDispatch: (dispatchable: HostDispatchable) => void,
    deviceDispatch: (dispatchable: DeviceDispatchable) => void,
    hostSubscribe: (subscription: Subscription, selector?: Selector) => void,
    deviceSubscribe: (subscription: Subscription, selector?: Selector) => void,
}

export type CreateIotes = <StrategyConfig, DeviceTypes extends string>(config: {
    topology: TopologyMap<StrategyConfig, DeviceTypes >,
    strategy: Strategy<StrategyConfig, DeviceTypes>,
    plugin?: (iotes: Iotes) => any,
    logLevel?: LogLevel,
    logger?: Logger,
}) => Iotes

declare const createIotes: CreateIotes

export { createIotes }
