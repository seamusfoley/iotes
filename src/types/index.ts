
export interface PhidgetDevice {
	type: 'ENCODER' | 'RFID_READER'
    name: string
    channel: number
	config: { [key: string]: any }
}

export interface PhidgetReactConfig {	
	name: string
    phidgetHost: string
    phdigetPassword?: string
    mqttHost?: string
    isMockWithMQTT?: boolean
	phidgetDevices: PhidgetDevice[]
}


// State pushed to subscribers should have either strings or numbers as types
export type State = { [key: string]: any }

// Disaptcable get unwrapped in the store object for predictable error handling
export type Dispatchable = State | Error

export interface Store {
    dispatch: ( dispatchable: Dispatchable ) => void
    subscribe: (subscriber: ( state: State ) => void) => void
}