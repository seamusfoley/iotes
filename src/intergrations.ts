
import { createIntergration } from "./intergration"
import { PhidgetReactConfig, DeviceDefinition } from './types'

type DeviceMap = DeviceDefinition[]

const createIntergrations = (config: PhidgetReactConfig) => (deviceMap: DeviceMap) => {
    const { isMockWithMQTT } = config

    return createIntergration(
        deviceMap,
        config,
        strategy,
    )
}
