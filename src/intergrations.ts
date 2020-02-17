
import { createIntergration } from './intergration'
import { PhidgetReactConfig, DeviceConfig } from './types'

type DeviceMap = DeviceConfig[]

export const createIntergrations = (config: PhidgetReactConfig) => (
    deviceMap: DeviceMap, strategy: any,
) => (
    // const { isMockWithMQTT } = config

    createIntergration({ deviceMap, config, strategy })
)
