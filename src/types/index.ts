
export type IntergrationClientOptions = {
    host: string
    port: string
    name: string
    password: string
}

export type Intergration = {
    [key in DeviceType]: (name: string, channel: string, dispatch: Dispatchable) => void
}

export type IntergrationDefinition = { [key in DeviceType]: (device: DeviceDefinition) => void}

export type DeviceType = 'RFID_READER' | 'ROTARY_ENCODER'

export type DeviceDefinition = {
    type: DeviceType
    name: string,
    channel: number
    dispatch: any
}

export interface PhidgetReactConfig {
    name: string
    phidgetHost: string
    phdigetPassword?: string
    mqttHost?: string
    isMockWithMQTT?: boolean
    phidgetDevices: DeviceDefinition[]
}

// Logging solution
export interface Logger {
    log: (log: string) => any
    info: (info: string) => any
    warn: (warning: string) => any
    error: (error: string) => any
}

export type LogLevel = 'SILENT' | 'INFO' | 'LOG' | 'WARN' | 'DEBUG'

// State pushed to subscribers should have either strings or numbers as types
export type State = { [key: string]: any }

// Disaptcable get unwrapped in the store object for predictable error handling
export type Dispatchable = State | Error

export interface Store {
    dispatch: (dispatchable: Dispatchable) => void
    subscribe: (subscriber: (state: State) => void) => void
}
